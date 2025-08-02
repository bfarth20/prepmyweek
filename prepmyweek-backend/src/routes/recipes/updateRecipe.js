/**
 * Handler for updating an existing recipe.
 * Ensures validation, authorization, and correct linking of stores and ingredients.
 */

import { prisma } from "../../prismaClient.js";
import { createRecipeSchema } from "../../schemas/recipe.schema.js";
import {
  getUnitType,
  convertVolumeToTbsp,
  convertWeightToOz,
} from "../../utils/unitConversions.js";
import { z } from "zod";

// Helper function to send a consistent JSON response
const sendResponse = (res, status, payload) => {
  const success = status < 400;
  res.status(status).json({ success, ...payload });
};

export const updateRecipe = async (req, res) => {
  const recipeId = parseInt(req.params.id);

  let validatedData;
  try {
    validatedData = createRecipeSchema.parse(req.body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return sendResponse(res, 400, {
        error: err.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      });
    }
    return sendResponse(res, 500, { error: "Unexpected validation error" });
  }

  // destructure validated data
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
    isVegetarian,
  } = validatedData;

  try {
    // Look up the recipe and verify the user owns it
    const existing = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (
      !existing ||
      (existing.userId !== req.user.userId && !req.user.isAdmin)
    ) {
      return sendResponse(res, 403, {
        error: "Unauthorized to edit this recipe",
      });
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
        isVegetarian,
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

    // Extract IDs of ingredients submitted that have recipeIngredientId (existing ingredients)
    const submittedIngredientIds = validIngredients
      .filter((ing) => ing.recipeIngredientId)
      .map((ing) => ing.recipeIngredientId);

    // Delete all recipeIngredients for this recipe that are NOT in the submitted IDs
    await prisma.recipeIngredient.deleteMany({
      where: {
        recipeId,
        id: {
          notIn:
            submittedIngredientIds.length > 0 ? submittedIngredientIds : [0],
        },
      },
    });

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

      // Normalize units and quantities (same as createRecipe)
      const unitType = getUnitType(ing.unit);
      let normalizedQuantity = ing.quantity;
      let normalizedUnit = ing.unit?.toLowerCase() || null;

      try {
        if (unitType === "volume") {
          normalizedQuantity = convertVolumeToTbsp(
            ing.quantity,
            normalizedUnit
          );
          normalizedUnit = "tbsp";
        } else if (unitType === "weight") {
          normalizedQuantity = convertWeightToOz(ing.quantity, normalizedUnit);
          normalizedUnit = "oz";
        }
        // count units or unknown units: keep as is
      } catch (error) {
        console.warn(
          `Unit conversion failed for ingredient "${ing.name}":`,
          error
        );
      }

      if (ing.recipeIngredientId) {
        // Update existing ingredient and its link
        await prisma.recipeIngredient.update({
          where: { id: ing.recipeIngredientId },
          data: {
            quantity: ing.quantity,
            unit: ing.unit,
            normalizedQuantity,
            normalizedUnit,
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
            normalizedQuantity,
            normalizedUnit,
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
