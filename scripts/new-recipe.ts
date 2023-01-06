import process from "process";
import fs from "fs";
import path from "path";
import readline from "readline-sync";
import { deaccent } from "../src/util.js";

const TEMPLATE_FILE = "recipe-template.md";
const RECIPES_DIR = "src/pages/recept";

const usage = `
Usage: pnpm create:recipe <name> [source]
       pnpm create:recipe --help
       pnpm create:recipe

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

  const name = args[0] as string;
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

function slugify(s: string): string {
  return deaccent(s)
    .toLocaleLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function existingRecipes(cwd: string) {
  return fs
    .readdirSync(path.join(cwd, RECIPES_DIR))
    .filter((fname) => path.extname(fname) === ".md")
    .map((fname) => fname.slice(0, -3));
}

function toFileName(existingRecipes: string[], s: string): string {
  const originalSlug = slugify(s);
  let slug = originalSlug;
  let nCopies = 0;
  while (existingRecipes.includes(slug)) {
    nCopies += 1;
    slug = originalSlug + "-" + nCopies;
  }
  return slug + ".md";
}

async function getParameters(): Promise<{ name: string; source: string }> {
  console.log("Enter recipe details. Fields marked with '*' are required.");
  const name = readline.question("[*] Recipe name: ");
  const source = readline.question("[ ] Recipe source: ");
  console.log();
  return { name, source };
}
