export type Ingredient = {
  name: string;
  qty?: number;
  unit?: string;
}

export type IngredientGroup = {
  name: string;
  ingredients: Ingredient[]
}