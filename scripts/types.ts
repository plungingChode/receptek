/**
 * Searchable properties of a recipe extracted from its frontmatter
 * and file metadata.
 */
export type IndexedRecipe = {
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

export type RecipeFrontmatter = {
  title: string;
  author?: string;
  ingredients: string;
};
