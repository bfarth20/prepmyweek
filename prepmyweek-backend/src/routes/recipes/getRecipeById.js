/**
 * Handler for fetching a single recipe by ID, including full ingredient data,
 * user info, and store associations.
 */

import { prisma } from "../../prismaClient.js";
import {
  getUnitType,
  convertTbspToBestUnit,
  convertOzToBestUnit,
  pluralizeUnit,
} from "../../utils/unitConversions.js";

// Helper to send consistent API responses with success flag and status code
const sendResponse = (res, status, payload) => {
  const success = status < 400;
  res.status(status).json({ success, ...payload });
};

export const getRecipeById = async (req, res) => {
  const recipeId = parseInt(req.params.id);

  let preferMetric = false;

  try {
    // Use preferMetric from query param if provided
    if (req.query.preferMetric !== undefined) {
      preferMetric = req.query.preferMetric === "true";
    } else {
      // Otherwise fallback to user preference from DB
      const userId = req.user?.userId;
      if (userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { preferMetric: true },
        });
        preferMetric = user?.preferMetric ?? false;
      }
    }

    console.log("Effective preferMetric value:", preferMetric);

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
      ingredients: recipe.ingredients.map((ri) => {
        const { id, name } = ri.ingredient;
        const quantityForConversion = ri.normalizedQuantity ?? ri.quantity;
        const unitForConversion = ri.normalizedUnit ?? ri.unit;

        let displayQuantity = quantityForConversion;
        let displayUnit = unitForConversion;

        try {
          const unitType = getUnitType(unitForConversion);
          if (unitType === "volume") {
            const converted = convertTbspToBestUnit(
              quantityForConversion,
              preferMetric
            );
            displayQuantity = converted.amount;
            displayUnit = converted.unit;
          } else if (unitType === "weight") {
            const converted = convertOzToBestUnit(
              quantityForConversion,
              preferMetric
            );
            displayQuantity = converted.amount;
            displayUnit = converted.unit;
          }
          // Count-based units remain unchanged
        } catch (err) {
          console.warn(`Conversion error for ingredient ${name}:`, err);
        }

        return {
          id,
          recipeIngredientId: ri.id,
          name,
          quantity: ri.quantity, // original quantity
          unit: ri.unit, // original unit
          displayQuantity,
          displayUnit,
          formattedQuantity:
            displayQuantity && displayUnit
              ? `${displayQuantity} ${pluralizeUnit(displayUnit, displayQuantity)}`
              : null,
          storeSection: ri.storeSection,
          isOptional: ri.isOptional,
          preparation: ri.preparation,
        };
      }),
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
