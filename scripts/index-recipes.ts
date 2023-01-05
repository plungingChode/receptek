import "dotenv/config";

import fm from "front-matter";
import fs from "fs";
import path from "path";

// WTF is this module resolution? (on Windows, Node 18)
import { isIngredientList, parseIngredients } from "../src/ingredients.js";
import type { Ingredient } from "../src/types.js";
import { deaccent } from "../src/util.js";

const RECIPE_INDEX = "/recept";
const INDEX_FILENAME = "recipe-index.json";

const cwd = process.cwd();
const recipesDir = path.resolve(cwd, "src/pages/recept");

if (!fs.existsSync(recipesDir)) {
  throw new Error(`recipes not found (tried: ${recipesDir})`);
}

const recipePaths = fs
  .readdirSync(recipesDir)
  .filter((f) => path.extname(f) === ".md")
  .map((p) => path.resolve(recipesDir, p));

const outFile = path.resolve(cwd, "src/data", INDEX_FILENAME);

const indexedRecipes = recipePaths.map(indexRecipe).sort(compareIndexedRecipes);
const index = JSON.stringify(indexedRecipes, null, 2);
fs.writeFileSync(outFile, index, { encoding: "utf-8", flag: "w" });

type IndexedRecipe = {
  slug: string;
  title: string;
  title_search: string;
  author: string | undefined;
  ingredients: string;
  ingredients_search: string;
};

function indexRecipe(file: string): IndexedRecipe {
  const content = fs.readFileSync(file, "utf-8");

  // Typescript doesn't understand that this thing is a function (even though it did before)
  const parse = fm as any;
  const parsed: { attributes: unknown } = parse(content);
  const { attributes } = parsed;

  if (!isRecipeFrontmatter(attributes)) {
    console.log(attributes);
    throw new Error("doesn't contain a valid recipe frontmatter");
  }

  const ingredients = parseIngredients(attributes.ingredients);
  const { title, author } = attributes;

  let ingredientList: Ingredient[];
  if (isIngredientList(ingredients)) {
    ingredientList = ingredients.list;
  } else {
    ingredientList = ingredients.groups.flatMap((g) => g.ingredients);
  }
  ingredientList.sort((a, b) => a.name.localeCompare(b.name));

  const ingredientsStr = ingredientList.map((i) => i.name).join(", ");
  const ingredientsSearch = deaccent(ingredientsStr);
  const titleSearch = deaccent(title.toLowerCase());
  const slug = RECIPE_INDEX + "/" + path.basename(file, ".md");

  return {
    ingredients: ingredientsStr,
    ingredients_search: ingredientsSearch,
    slug,
    title,
    title_search: titleSearch,
    author,
  };
}

type RecipeFrontmatter = {
  title: string;
  author?: string;
  ingredients: string;
};

function isRecipeFrontmatter(fm: unknown): fm is RecipeFrontmatter {
  return (
    typeof fm === "object" &&
    fm !== null &&
    "title" in fm &&
    typeof fm.title === "string" &&
    "ingredients" in fm &&
    typeof fm.ingredients === "string" &&
    ("author" in fm ? typeof fm.author === "string" : true)
  );
}

function env(name: string, defaultValue?: string): string {
  const envvars = process.env;
  if (!(name in envvars)) {
    if (!defaultValue) {
      throw new Error(`"${name}" is a required environment variable`);
    }
    return defaultValue;
  }
  return envvars[name] as string;
}

function compareIndexedRecipes(a: IndexedRecipe, b: IndexedRecipe): number {
  if (a.title < b.title) {
    return -1;
  } else if (a.title === b.title) {
    if (a.slug < b.slug) {
      return -1;
    } else {
      return 1;
    }
  } else {
    return 0;
  }
}
