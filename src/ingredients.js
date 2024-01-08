/**
 * @typedef {import("./types").Ingredient} Ingredient
 * @typedef {import("./types").IngredientGroup} IngredientGroup
 *
 * @typedef {{ list: Ingredient[] }} IngredientList
 * @typedef {{ groups: IngredientGroup[] }} IngredientGroups
 * @typedef {IngredientList | IngredientGroups} Ingredients
 */

/**
 * @param {string} ingredients
 * @returns {Ingredients}
 */
export function parseIngredients(ingredients) {
  const lines = ingredients.split("\n").filter((l) => l.length > 0);
  const hasGroups = lines.some((line) => line.startsWith("#"));

  if (!hasGroups) {
    return { list: lines.map(parseIngredient) };
  }

  /** @type {IngredientGroup[]} */
  const groups = [];
  /** @type {IngredientGroup} */
  let currentGroup = { name: "", ingredients: [] };
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

/**
 * @param {string} line
 * @returns {Ingredient}
 */
export function parseIngredient(line) {
  /** @param {string} reason */
  const error = (reason) => {
    throw new Error(
      [
        `failed to parse "${line}" as ingredient, reason: ${reason}\n`,
        'ingredients must be formatted as "{name}" or "{name} -- {quantity} {unit}"',
        "and match the regex /(\\w+) -- (\\d+(\\.\\d+)) (\\w+)/",
      ].join(" ")
    );
  };

  const [name, rest] = line.split(" -- ");
  if (!rest) {
    if (!name) {
      return error("invalid name");
    }
    return { name };
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

/**
 * @param {string} line
 * @returns {string}
 */
function parseGroupName(line) {
  const name = line.slice(2).trim();
  if (!name) {
    throw new Error("ingredient group name cannot be empty");
  }
  return name;
}

/**
 * @param {string} line
 * @returns {boolean}
 */
function isGroupName(line) {
  return line.startsWith("#");
}

/**
 * @param {unknown} o
 * @returns {o is IngredientList}
 */
export function isIngredientList(o) {
  return typeof o === "object" && o !== null && "list" in o && Array.isArray(o.list);
}

/**
 * @param {unknown} o
 * @returns {o is IngredientGroups}
 */
export function isIngredientGroups(o) {
  return typeof o === "object" && o !== null && "groups" in o && Array.isArray(o.groups);
}

