/**
 * Utility to validate recipe data used in both create and update operations.
 * Ensures all required fields are present and properly formatted.
 * THIS IS NO LONGER USED-I SWITCHED THE VALIDATION OVER TO ZOD
 */

export function validateRecipeData(data) {
  const {
    title,
    description,
    instructions,
    prepTime,
    cookTime,
    course,
    servings,
    storeIds,
    ingredients,
  } = data;

  // Validate required text fields
  if (!title || typeof title !== "string" || title.trim().length < 3) {
    return "Title is required and must be at least 3 characters long.";
  }

  if (
    !instructions ||
    typeof instructions !== "string" ||
    instructions.trim().length < 5
  ) {
    return "Instructions are required and must be at least 5 characters long.";
  }

  // Optional but if present, must be valid strings
  if (
    description &&
    (typeof description !== "string" || description.length > 1000)
  ) {
    return "Description must be a string under 1000 characters.";
  }

  // Validate numeric fields
  if (
    prepTime !== undefined &&
    (typeof prepTime !== "number" || prepTime < 0)
  ) {
    return "Prep time must be a non-negative number.";
  }

  if (
    cookTime !== undefined &&
    (typeof cookTime !== "number" || cookTime < 0)
  ) {
    return "Cook time must be a non-negative number.";
  }

  if (
    servings !== undefined &&
    (typeof servings !== "number" || servings <= 0)
  ) {
    return "Servings must be a positive number.";
  }

  // Validate course if present
  const validCourses = ["BREAKFAST", "LUNCH", "DINNER", "SNACK_SIDE"];
  if (course && !validCourses.includes(course)) {
    return `Course must be one of: ${validCourses.join(", ")}`;
  }

  // Validate storeIds
  if (!Array.isArray(storeIds)) {
    return "storeIds must be an array.";
  }

  // Validate ingredients
  if (!Array.isArray(ingredients)) {
    return "ingredients must be an array.";
  }

  for (const ing of ingredients) {
    if (
      !ing.name ||
      typeof ing.name !== "string" ||
      ing.name.trim().length < 2
    ) {
      return "Each ingredient must have a name of at least 2 characters.";
    }
  }

  return null; // Valid
}
