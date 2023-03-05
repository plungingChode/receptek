import type { Ingredient, IngredientGroup } from "./types.js";

export type Ingredients = { list: Ingredient[] } | { groups: IngredientGroup[] };

export function parseIngredients(ingredients: string): Ingredients {
  const lines = ingredients.split("\n").filter((l) => l.length > 0);
  const hasGroups = lines.some((line) => line.startsWith("#"));

  if (!hasGroups) {
    return { list: lines.map(parseIngredient) };
  }

  const groups: IngredientGroup[] = [];
  let currentGroup: IngredientGroup = { name: "", ingredients: [] };
  for (const line of lines) {
    if (isGroupName(line)) {
      if (currentGroup.name) {
        groups.push(currentGroup);
      }
      currentGroup = { name: parseGroupName(line), ingredients: [] };
    } else {
      currentGroup.ingredients.push(parseIngredient(line));
    }
  }

  if (currentGroup.name) {
    groups.push(currentGroup);
  }
  return { groups };
}

export function parseIngredient(line: string): Ingredient {
  const error = (reason: string) => {
    throw new Error(
      [
        `failed to parse "${line}" as ingredient, reason: ${reason}\n`,
        'ingredients must be formatted as "{name}" or "{name} -- {quantity} {unit}"',
        'and match the regex /(\\w+) -- (\\d+(\\.\\d+)) (\\w+)/',
      ].join(" ")
    );
  };

  const [name, rest] = line.split(" -- ");
  if (!rest) {
    if (!name) {
      return error("invalid name");
    }
    return { name }
  }

  const [qtyStr, ...unitParts] = (rest ?? "").split(" ");

  const qty = Number.parseFloat(qtyStr ?? "");

  if (!name) {
    return error("invalid name");
  } else if (!Number.isFinite(qty)) {
    return error("invalid quantity");
  } else if (!unitParts) {
    return error("invalid unit");
  } else {
    return { name, qty, unit: unitParts.join(" ") };
  }
}

function parseGroupName(line: string): string {
  const name = line.slice(2).trim();
  if (!name) {
    throw new Error("ingredient group name cannot be empty");
  }
  return name;
}

function isGroupName(line: string): boolean {
  return line.startsWith("#");
}

export function isIngredientList(o: unknown): o is { list: Ingredient[] } {
  return typeof o === "object" && o !== null && "list" in o && Array.isArray(o.list);
}

export function isIngredientGroups(o: unknown): o is { groups: IngredientGroup[] } {
  return typeof o === "object" && o !== null && "groups" in o && Array.isArray(o.groups);
}
