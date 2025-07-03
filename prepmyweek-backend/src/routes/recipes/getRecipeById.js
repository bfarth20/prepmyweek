/**
 * Handler for fetching a single recipe by ID, including full ingredient data,
 * user info, and store associations.
 */

import { prisma } from "../../prismaClient.js";

// Helper to send consistent API responses with success flag and status code
const sendResponse = (res, status, payload) => {
  const success = status < 400;
  res.status(status).json({ success, ...payload });
};

export const getRecipeById = async (req, res) => {
  // Parse the recipe ID from the request parameters
  const recipeId = parseInt(req.params.id);

  try {
    // Fetch recipe from the database with full associations
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        recipeStores: {
          include: {
            store: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
              },
            },
          },
        },
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    if (!recipe) {
      return sendResponse(res, 404, { error: "Recipe not found" });
    }

    // Format the recipe data for frontend consumption
    const formattedRecipe = {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      imageUrl: recipe.imageUrl,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      totalTime: (recipe.prepTime || 0) + (recipe.cookTime || 0),
      servings: recipe.servings,
      course: recipe.course,
      instructions: recipe.instructions,
      isVegetarian: recipe.isVegetarian,
      createdAt: recipe.createdAt,
      stores: recipe.recipeStores.map((rs) => ({
        id: rs.store.id,
        name: rs.store.name,
        logoUrl: rs.store.logoUrl,
      })),
      user: recipe.user,
      status: recipe.status,
      ingredients: recipe.ingredients.map((ri) => ({
        id: ri.ingredient.id,
        recipeIngredientId: ri.id,
        name: ri.ingredient.name,
        quantity: ri.quantity,
        unit: ri.unit,
        storeSection: ri.storeSection,
        isOptional: ri.isOptional,
        preparation: ri.preparation,
      })),
    };

    sendResponse(res, 200, { data: formattedRecipe });
  } catch (error) {
    console.error(
      `[GET /recipes/${req.params.id}] Failed to fetch recipe:`,
      error
    );
    sendResponse(res, 500, { error: "Failed to fetch recipe" });
  }
};
