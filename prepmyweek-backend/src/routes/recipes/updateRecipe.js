/**
 * Handler for updating an existing recipe.
 * Ensures validation, authorization, and correct linking of stores and ingredients.
 */

import { prisma } from "../../prismaClient.js";
import { validateRecipeData } from "./validateRecipeData.js";

// Helper function to send a consistent JSON response
const sendResponse = (res, status, payload) => {
  const success = status < 400;
  res.status(status).json({ success, ...payload });
};

export const updateRecipe = async (req, res) => {
  const recipeId = parseInt(req.params.id);

  // Destructure expected fields from request body
  const {
    title,
    description,
    instructions,
    prepTime,
    cookTime,
    course,
    servings,
    storeIds = [],
    ingredients = [],
    imageUrl,
  } = req.body;

  try {
    // Look up the recipe and verify the user owns it
    const existing = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!existing || existing.userId !== req.user.userId) {
      return sendResponse(res, 403, {
        error: "Unauthorized to edit this recipe",
      });
    }

    // Validate the incoming recipe data
    const validationError = validateRecipeData({
      title,
      description,
      instructions,
      prepTime,
      cookTime,
      course,
      servings,
      storeIds,
      ingredients,
    });

    if (validationError) {
      return sendResponse(res, 400, { error: validationError });
    }

    // Update core recipe fields
    await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        title,
        description,
        instructions,
        prepTime,
        cookTime,
        course,
        servings,
        imageUrl,
      },
    });

    // Replace store associations with new ones
    await prisma.recipeStore.deleteMany({ where: { recipeId } });
    await Promise.all(
      storeIds.map((storeId) =>
        prisma.recipeStore.create({ data: { recipeId, storeId } })
      )
    );

    // Filter out invalid ingredients early
    const validIngredients = ingredients.filter(
      (ing) =>
        ing &&
        typeof ing === "object" &&
        typeof ing.name === "string" &&
        ing.name.trim().length >= 2
    );

    for (const ing of validIngredients) {
      // Normalize and validate the ingredient name
      const normalizedName = ing.name.trim().toLowerCase().replace(/[’]/g, "'");
      const validNameRegex = /^[a-zA-Z0-9\s\-']+$/;

      if (
        normalizedName.length < 2 ||
        normalizedName.length > 50 ||
        !validNameRegex.test(normalizedName)
      ) {
        return sendResponse(res, 400, {
          error: `Invalid ingredient name '${ing.name}' — must be 2–50 characters with valid characters.`,
        });
      }

      if (ing.recipeIngredientId) {
        // Update existing ingredient and its link
        await prisma.recipeIngredient.update({
          where: { id: ing.recipeIngredientId },
          data: {
            quantity: ing.quantity,
            unit: ing.unit,
            storeSection: ing.storeSection,
            isOptional: ing.isOptional,
            preparation: ing.preparation || null,
            ingredient: {
              update: {
                name: normalizedName,
              },
            },
          },
        });
      } else {
        // Look for existing ingredient or create new one
        let ingredient = await prisma.ingredient.findUnique({
          where: { name: normalizedName },
        });

        if (!ingredient) {
          ingredient = await prisma.ingredient.create({
            data: { name: normalizedName },
          });
        }

        // Create link to the recipe via RecipeIngredient
        await prisma.recipeIngredient.create({
          data: {
            recipeId,
            ingredientId: ingredient.id,
            quantity: ing.quantity,
            unit: ing.unit || null,
            storeSection: ing.storeSection || null,
            isOptional: ing.isOptional || false,
            preparation: ing.preparation || null,
          },
        });
      }
    }

    // Fetch full recipe including user, ingredients, and store data
    const fullRecipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        ingredients: { include: { ingredient: true } },
        recipeStores: {
          include: {
            store: { select: { id: true, name: true, logoUrl: true } },
          },
        },
      },
    });

    sendResponse(res, 200, { data: fullRecipe });
  } catch (error) {
    console.error("Error updating recipe:", error);
    sendResponse(res, 500, { error: "Failed to update recipe" });
  }
};
