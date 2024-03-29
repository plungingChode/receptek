import process from "process";
import fs from "fs";
import path from "path";
import readline from "readline-sync";

const TEMPLATE_FILE = "recipe-template.md";
const RECIPES_DIR = "src/pages/recept";

const usage = `
Usage: npm run new:recipe <name> [source]
       npm run new:recipe --help
       npm run new:recipe

Generate a new recipe from the common template. Omitting the required parameters
will prompt the user for them instead.

Options:
  -h, --help   - Print this message.
  
Positional arguments:
  * name   - The name of the recipe. This will also be used to generate the file name. 
  * source - The source of the recipe. A URL, image name or source description.
`;

main();

async function main() {
  const args = process.argv.slice(2);
  const cwd = process.cwd();

  if (args[0] === "-h" || args[0] === "--help") {
    console.log(usage);
    process.exit(0);
  }

  if (args.length < 1) {
    const params = await getParameters();
    args[0] = params.name;
    args[1] = params.source;
  }

  const name = /** @type {string} */ args[0];
  const source = `# forrás: ${args[1] || ""}`;

  if (!name) {
    console.log(usage);
    process.exit(1);
  }

  // Replace placeholder fields with concrete values
  const template = fs.readFileSync(TEMPLATE_FILE, "utf-8");
  const content = template.replace("<name>", name).replace("# forrás: ", source);

  // Create a new entry in the RECIPES_DIR
  const fileName = toFileName(existingRecipes(cwd), name);
  const outFile = path.join(cwd, RECIPES_DIR, fileName);
  fs.writeFileSync(outFile, content, { encoding: "utf-8", flag: "w" });

  console.log(`✓ Created ${outFile}`);
}

/**
 * Converts a string to a URL slug-friendly format
 * @param {string} name
 * @returns {string}
 */
function slugify(name) {
  return name
    .normalize("NFD")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/([^a-z0-9-])/g, "")
    .replace(/[-]+/g, "-");
}

/**
 * Returns the filenames of existing recipes in the `RECIPES_DIR`
 *
 * @param {string} cwd
 * @returns {string[]}
 */
function existingRecipes(cwd) {
  return fs
    .readdirSync(path.join(cwd, RECIPES_DIR))
    .filter((fname) => path.extname(fname) === ".md")
    .map((fname) => fname.slice(0, -3));
}

/**
 * Generates a filename from a recipe slug. If there's already a file with
 * the same name, appends an incrementing number at the end.
 *
 * @param {string[]} existingRecipes
 * @param {string} s
 * @returns {string}
 */
function toFileName(existingRecipes, s) {
  const originalSlug = slugify(s);
  let slug = originalSlug;
  let nCopies = 0;
  while (existingRecipes.includes(slug)) {
    nCopies += 1;
    slug = originalSlug + "-" + nCopies;
  }
  return slug + ".md";
}

/**
 * Prompt the user for inputs required to create a new recipe.
  *
  * @returns {Promise<{ name: string, source: string }>}
 */
async function getParameters() {
  console.log("Enter recipe details. Fields marked with '*' are required.");
  const name = readline.question("[*] Recipe name: ");
  const source = readline.question("[ ] Recipe source: ");
  console.log();
  return { name, source };
}
