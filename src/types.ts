export type Ingredient = SimpleIngredient | MeasuredIngredient;
export type SimpleIngredient = { name: string };
export type MeasuredIngredient = { name: string; qty: number; unit: string };

export type IngredientGroup = {
  name: string;
  ingredients: Ingredient[];
};
