/**
 * Handler for creating a new recipe.
 * Validates data and connects stores and ingredients appropriately.
 */

import { prisma } from "../../prismaClient.js";
import { validateRecipeData } from "./validateRecipeData.js";

const sendResponse = (res, status, payload) => {
  const success = status < 400;
  res.status(status).json({ success, ...payload });
};

export const createRecipe = async (req, res) => {
  const userId = req.user.userId;
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

  // Validate required fields
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
