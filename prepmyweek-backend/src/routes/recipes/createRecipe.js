/**
 * Handler for creating a new recipe.
 * Validates data and connects stores and ingredients appropriately.
 */

import { prisma } from "../../prismaClient.js";
import { createRecipeSchema } from "../../schemas/recipe.schema.js";
import { z } from "zod";

const sendResponse = (res, status, payload) => {
  const success = status < 400;
  res.status(status).json({ success, ...payload });
};

export const createRecipe = async (req, res) => {
  const userId = req.user.userId;

  let parsed;
  try {
    console.log("Raw request body:", req.body);
    parsed = createRecipeSchema.parse(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Zod validation errors:", error.errors);
      return sendResponse(res, 400, { error: error.errors });
    }
    console.error("Validation failed:", error);
    return sendResponse(res, 500, { error: "Server error during validation" });
  }

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
  } = parsed;

  try {
    // Create the recipe
    const recipe = await prisma.recipe.create({
      data: {
        title,
        description,
        instructions,
        prepTime,
        cookTime,
        course,
        servings,
        imageUrl,
        user: { connect: { id: userId } },
        status: "pending",
      },
    });

    // Connect associated stores
    await Promise.all(
      storeIds.map((storeId) =>
        prisma.recipeStore.create({ data: { recipeId: recipe.id, storeId } })
      )
    );

    // Add ingredients
    for (const ing of ingredients) {
      const normalizedName = ing.name.trim().toLowerCase().replace(/[’]/g, "'");

      let ingredient = await prisma.ingredient.findUnique({
        where: { name: normalizedName },
      });

      if (!ingredient) {
        ingredient = await prisma.ingredient.create({
          data: {
            name: normalizedName,
          },
        });
      }

      await prisma.recipeIngredient.create({
        data: {
          recipeId: recipe.id,
          ingredientId: ingredient.id,
          quantity: ing.quantity,
          unit: ing.unit || null,
          storeSection: ing.storeSection || null,
          isOptional: ing.isOptional || false,
          preparation: ing.preparation || null,
        },
      });
    }

    // Fetch full recipe with associations
    const fullRecipe = await prisma.recipe.findUnique({
      where: { id: recipe.id },
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

    sendResponse(res, 201, { data: fullRecipe });
  } catch (error) {
    console.error("Error creating recipe:", error);
    sendResponse(res, 500, { error: "Failed to create recipe" });
  }
};
