import "dotenv/config";

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

import { isIngredientList, parseIngredients } from "../src/ingredients.js";
import { deaccent, isUndefined } from "../src/util.js";
import { parse } from "yaml";

// TODO read these constants from env
const RECIPE_INDEX = "/recept";
const INDEX_FILENAME = "recipe-index.json";

/**
 * @typedef {import("./types").IndexedRecipe} IndexedRecipe
 * @typedef {import("./types").RecipeFrontmatter} RecipeFrontmatter
 */

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
  /** @type {IndexedRecipe[]} */
  const indexedRecipes = [];
  for (const p of recipePaths) {
    try {
      const fm = await readFrontmatter(p);
      const indexed = indexRecipe(p, fm);
      indexedRecipes.push(indexed);
    } catch (e) {
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
 * @param {string} file
 * @return {Promise<string>}
 */
function readFrontmatter(file) {
  /** @type {string[]} */
  const frontmatter = [];
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

/**
 * @param {string} fileName
 * @param {string} frontmatter
 * @returns {IndexedRecipe}
 */
function indexRecipe(fileName, frontmatter) {
  // FIXME use YAML array for ingredients instead of a multiline string
  const fm = parse(frontmatter);

  if (!isRecipeFrontmatter(fm)) {
    console.log(fm);
    throw new Error("doesn't contain a valid recipe frontmatter");
  }

  const ingredients = parseIngredients(fm.ingredients);
  const { title, author } = fm;

  /** @type {import("../src/types").Ingredient[]} */
  let ingredientList;
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

/**
 * @param {unknown} fm
 * @returns {fm is RecipeFrontmatter}
 */
function isRecipeFrontmatter(fm) {
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

/**
 * @param {string} name
 * @param {string | undefined} defaultValue
 * @returns {string}
 */
function env(name, defaultValue = undefined) {
  const envvars = process.env;
  if (!(name in envvars)) {
    if (!defaultValue) {
      throw new Error(`"${name}" is a required environment variable`);
    }
    return defaultValue;
  }
  const value = envvars[name];
  if (isUndefined(value)) {
      throw new Error(`"${name}" is a required environment variable`);
  }
  return value;
}

/**
 * @param {IndexedRecipe} a
 * @param {IndexedRecipe} b
 * @returns {number}
 */
function compareIndexedRecipes(a, b) {
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
