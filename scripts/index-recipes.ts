import "dotenv/config";

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { isIngredientList, parseIngredients } from "../src/ingredients.js";
import type { Ingredient } from "../src/types.js";
import { deaccent } from "../src/util.js";
import { parse } from "yaml";

// TODO read these constants from env
const RECIPE_INDEX = "/recept";
const INDEX_FILENAME = "recipe-index.json";

main();

/**
 * Generate a searchable index from recipe frontmatter and write it as
 * a JSON file to `src/data/INDEX_FILENAME`.
 *
 * This file should **not be** committed, but instead regenerated during
 * deployment.
 */
async function main() {
  const cwd = process.cwd();
  const recipesDir = path.resolve(cwd, "src/pages/recept");

  if (!fs.existsSync(recipesDir)) {
    throw new Error(`recipes not found (tried: ${recipesDir})`);
  }

  const recipePaths = fs
    .readdirSync(recipesDir)
    .filter((f) => path.extname(f) === ".md")
    .map((p) => path.resolve(recipesDir, p));

  const outDir = path.resolve(cwd, "src/data");
  const outFile = path.resolve(outDir, INDEX_FILENAME);

  let haveErrors = false;
  const indexedRecipes: IndexedRecipe[] = [];
  for (const p of recipePaths) {
    try {
      const fm = await readFrontmatter(p);
      const indexed = indexRecipe(p, fm as string);
      indexedRecipes.push(indexed);
    } catch (e: unknown) {
      haveErrors = true;
      console.log(`Error in '${p}'`);
      if (e instanceof Error) {
        console.error(e.message);
      } else {
        console.error(e);
      }
    }
  }
  if (haveErrors) {
    process.exit(1);
  }
  const index = JSON.stringify(indexedRecipes);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, index, { encoding: "utf-8", flag: "w" });
}

/**
 * Searchable properties of a recipe extracted from its frontmatter
 * and file metadata.
 */
type IndexedRecipe = {
  /** The file name without extension */
  slug: string;
  /** The recipe title */
  title: string;
  /**
   * The recipe title in a fuzzy search-friendly format (without accents,
   * all lowercase).
   */
  title_search: string;
  /** The recipe author */
  author: string | undefined;
  /** The concatenated ingredient list, without units */
  ingredients: string;
  /**
   * The ingredient list in a fuzzy search-friendly format (no accents,
   * all lowercase).
   */
  ingredients_search: string;
};

function readFrontmatter(file: string): Promise<string> {
  const frontmatter: string[] = [];
  const stream = fs.createReadStream(file, "utf-8");
  const reader = readline.createInterface({ input: stream });

  let nDelimiters = 0;
  return new Promise((resolve) => {
    reader.on("line", (ln) => {
      if (ln === "---") {
        nDelimiters += 1;
        return;
      }
      if (nDelimiters === 2) {
        resolve(frontmatter.join("\n"));
        reader.close();
        return;
      }
      frontmatter.push(ln);
    });
  });
}

function indexRecipe(fileName: string, frontmatter: string): IndexedRecipe {
  // FIXME use YAML array for ingredients instead of a multiline string
  const fm: unknown = parse(frontmatter);

  if (!isRecipeFrontmatter(fm)) {
    console.log(fm);
    throw new Error("doesn't contain a valid recipe frontmatter");
  }

  const ingredients = parseIngredients(fm.ingredients);
  const { title, author } = fm;

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
  const slug = RECIPE_INDEX + "/" + path.basename(fileName, ".md");

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
