/**
 * Keeping this in case my other version crashes but this file was broken up into components
 */

import express from "express";
import { prisma } from "../prismaClient.js";
import { requireUser } from "../middleware/authMiddleware.js";

// Helper to send consistent API responses with success flag and status code
const sendResponse = (res, status, payload) => {
  const success = status < 400;
  res.status(status).json({ success, ...payload });
};

const router = express.Router();

// Fetch and format all recipes with limited user and store info
// GET /recipes - public route to list all recipes
router.get("/", async (req, res) => {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        ingredients: true,
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
        // reviews: true // Uncomment later to add the reviews
      },
    });

    const formatted = recipes.map((recipe) => {
      const totalTime = recipe.prepTime + recipe.cookTime;
      const ingredientCount = recipe.ingredients.length;

      //Placeholder for averageRating
      //const avgRating = recipe.reviews.length
      // ? recipe.reviews.reduce((acc, r) => acc + r.rating, 0) / recipe.reviews.length
      // : null;

      return {
        id: recipe.id,
        title: recipe.title,
        imageUrl: recipe.imageUrl,
        course: recipe.course,
        cookTime: recipe.cookTime,
        totalTime,
        numberOfIngredients: ingredientCount,
        // averageRating: avgRating,
        user: recipe.user,
        stores: recipe.recipeStores.map((rs) => rs.store),
      };
    });

    sendResponse(res, 200, { data: formatted });
  } catch (error) {
    console.error("[GET /recipes] Failed to fetch recipes:", error);
    sendResponse(res, 500, { error: "Failed to fetch recipes" });
  }
});

//Includes full ingredient data, user info, and store associations
// GET /recipes/:id - public route to fetch a full recipe by ID
router.get("/:id", async (req, res) => {
  const recipeId = parseInt(req.params.id);

  try {
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

    const formattedRecipe = {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      imageUrl: recipe.imageUrl,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      //Ensure totalTime is a number even if one of the fields is null
      totalTime: (recipe.prepTime || 0) + (recipe.cookTime || 0),
      servings: recipe.servings,
      course: recipe.course,
      instructions: recipe.instructions,
      stores: recipe.recipeStores.map((rs) => ({
        id: rs.store.id,
        name: rs.store.name,
        logoUrl: rs.store.logoUrl,
      })),
      user: recipe.user,
      status: recipe.status,
      //Flatten each recipeIngredient entry with its associated ingredient data
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
});

// Creates a new recipe with associated ingredients and store links
// POST /recipes - Protected route to create a new recipe
router.post("/", requireUser, async (req, res) => {
  try {
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

    //Input validation
    if (
      !title ||
      typeof title !== "string" ||
      title.trim().length < 3 ||
      title.length > 100
    ) {
      return sendResponse(res, 400, {
        error: "Title must be a string between 3 and 100 characters long.",
      });
    }

    //Description
    if (
      description &&
      typeof description === "string" &&
      description.length > 100
    ) {
      return sendResponse(res, 400, {
        error: "Description must be 100 characters or fewer.",
      });
    }

    //Instructions
    const cleanedInstructions = instructions.trim();

    if (
      typeof instructions !== "string" ||
      cleanedInstructions.length < 30 ||
      cleanedInstructions.length > 10000
    ) {
      return sendResponse(res, 400, {
        error:
          "Instructions must be a string between 30 and 10,000 characters.",
      });
    }

    // Step 1: Ensure ingredients is an array
    if (!Array.isArray(ingredients)) {
      return sendResponse(res, 400, {
        error: "Ingredients must be an array",
      });
    }

    // Step 2: Remove any completely blank or invalid entries (e.g., empty strings, undefined)
    ingredients = ingredients.filter(
      (ing) =>
        ing &&
        typeof ing === "object" &&
        typeof ing.name === "string" &&
        ing.name.trim().length >= 2
    );

    // Step 3: Ensure at least one valid ingredient remains
    if (ingredients.length === 0) {
      return sendResponse(res, 400, {
        error: "At least one valid ingredient is required",
      });
    }

    // Step 4: Now safely validate each cleaned ingredient
    for (const ing of ingredients) {
      if (ing.amount !== undefined && typeof ing.amount !== "number") {
        return sendResponse(res, 400, {
          error: `Ingredient '${ing.name}' has an invalid 'amount' — must be a number.`,
        });
      }

      if (ing.unit !== undefined && typeof ing.unit !== "string") {
        return sendResponse(res, 400, {
          error: `Ingredient '${ing.name}' has an invalid 'unit' — must be a string.`,
        });
      }

      if (ing.optional !== undefined && typeof ing.optional !== "boolean") {
        return sendResponse(res, 400, {
          error: `Ingredient '${ing.name}' has an invalid 'optional' flag — must be true or false.`,
        });
      }
    }

    //Preptime
    if (prepTime !== undefined) {
      if (
        typeof prepTime !== "number" ||
        !Number.isInteger(prepTime) ||
        prepTime < 0 ||
        prepTime > 1440
      ) {
        return sendResponse(res, 400, {
          error: "Prep time must be an integer between 0 and 1440 minutes.",
        });
      }
    }

    //Cooktime
    if (cookTime !== undefined) {
      if (
        typeof cookTime !== "number" ||
        !Number.isInteger(cookTime) ||
        cookTime < 0 ||
        cookTime > 1440
      ) {
        return sendResponse(res, 400, {
          error: "Cook time must be an integer between 0 and 1440 minutes.",
        });
      }
    }

    //Servings
    if (
      servings === undefined ||
      servings === null ||
      typeof servings !== "number" ||
      !Number.isInteger(servings) ||
      servings < 1 ||
      servings > 15
    ) {
      return sendResponse(res, 400, {
        error: "Servings is required and must be an integer between 1 and 15.",
      });
    }

    //Store Selection
    if (!Array.isArray(storeIds) || storeIds.length === 0) {
      return sendResponse(res, 400, {
        error: "You must select at least one store.",
      });
    }

    const newRecipe = await prisma.recipe.create({
      data: {
        title,
        description,
        instructions,
        prepTime,
        cookTime,
        course,
        servings,
        imageUrl,
        user: {
          connect: { id: req.user.userId },
        },
      },
    });

    // Associate recipe with multiple stores via explicit join table

    if (storeIds.length > 0) {
      await Promise.all(
        storeIds.map((storeId) =>
          prisma.recipeStore.create({
            data: {
              recipeId: newRecipe.id,
              storeId: storeId,
            },
          })
        )
      );
    }

    const recipeIngredientPromises = ingredients.map(async (ing) => {
      // Basic structure and name type check
      if (!ing.name || typeof ing.name !== "string") {
        throw new Error("Each ingredient must have a valid 'name' field.");
      }

      // Normalize: trim, replace fancy apostrophes, and lowercase
      const rawName = ing.name.trim().replace(/[’]/g, "'");
      const normalizedName = rawName.toLowerCase();

      // Validate name length and characters
      const validNameRegex = /^[a-zA-Z0-9\s\-']+$/;
      if (
        normalizedName.length < 2 ||
        normalizedName.length > 50 ||
        !validNameRegex.test(normalizedName)
      ) {
        throw new Error(
          "Ingredient names must be 2–50 characters and contain only letters, numbers, spaces, dashes, or apostrophes."
        );
      }

      // Check if the ingredient already exists
      let existingIngredient = await prisma.ingredient.findUnique({
        where: { name: normalizedName },
      });

      // Create it if not found
      if (!existingIngredient) {
        existingIngredient = await prisma.ingredient.create({
          data: { name: normalizedName },
        });
      }

      console.log("Creating ingredient with:", normalizedName);

      // Create RecipeIngredient entry
      return prisma.recipeIngredient.create({
        data: {
          recipeId: newRecipe.id,
          ingredientId: existingIngredient.id,
          quantity: ing.quantity,
          unit: ing.unit || null,
          storeSection: ing.storeSection || null,
          isOptional: ing.isOptional || false,
          preparation: ing.preparation || null,
        },
      });
    });

    await Promise.all(recipeIngredientPromises);

    // Refetch recipe with full data for response
    const fullRecipe = await prisma.recipe.findUnique({
      where: { id: newRecipe.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        ingredients: {
          include: { ingredient: true },
        },
        recipeStores: {
          include: {
            store: {
              select: { id: true, name: true, logoUrl: true },
            },
          },
        },
      },
    });

    sendResponse(res, 201, { data: fullRecipe });
  } catch (error) {
    console.error("Error creating recipe:", error);

    // Prisma error handling
    if (error.code === "P2002") {
      return sendResponse(res, 400, {
        error: "A record with that value already exists",
      });
    }

    // Custom error (e.g., thrown in validation)
    if (error.message && typeof error.message === "string") {
      return sendResponse(res, 400, { error: error.message });
    }

    // Generic fallback
    sendResponse(res, 500, { error: "Failed to create recipe" });
  }
});

// PUT /recipes/:id - Protected route to update a recipe
router.put("/:id", requireUser, async (req, res) => {
  const recipeId = parseInt(req.params.id);
  const {
    title,
    description,
    instructions,
    storeIds = [],
    ingredients = [],
  } = req.body;

  try {
    // Verify ownership
    const existing = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    console.log("User trying to edit:", req.user);
    console.log("Recipe owner:", existing.userId);

    if (
      !existing ||
      (existing.userId !== req.user.userId && !req.user.isAdmin)
    ) {
      return sendResponse(res, 403, {
        error: "Unauthorized to edit this recipe",
      });
    }

    if (!title || !instructions) {
      return sendResponse(res, 400, {
        error: "Title and instructions are required",
      });
    }

    console.log("Incoming ingredient updates:", ingredients);

    // Update recipe fields
    await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(instructions && { instructions }),
        ...(req.body.course && { course: req.body.course }),
        ...(typeof req.body.prepTime === "number" && {
          prepTime: req.body.prepTime,
        }),
        ...(typeof req.body.cookTime === "number" && {
          cookTime: req.body.cookTime,
        }),
        ...(typeof req.body.servings === "number" && {
          servings: req.body.servings,
        }),
      },
    });

    // Remove and re-create store associations
    await prisma.recipeStore.deleteMany({ where: { recipeId } });

    if (storeIds.length > 0) {
      await prisma.recipeStore.createMany({
        data: storeIds.map((storeId) => ({ recipeId, storeId })),
      });
    }

    // Process ingredients
    if (Array.isArray(ingredients)) {
      for (const ing of ingredients) {
        if (ing.recipeIngredientId) {
          // Update existing RecipeIngredient and related Ingredient
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
                  name: ing.name,
                },
              },
            },
          });
        } else {
          // Create or reuse Ingredient, then create RecipeIngredient
          let ingredient = await prisma.ingredient.findUnique({
            where: { name: ing.name },
          });

          if (!ingredient) {
            ingredient = await prisma.ingredient.create({
              data: {
                name: ing.name,
              },
            });
          }

          await prisma.recipeIngredient.create({
            data: {
              quantity: ing.quantity,
              unit: ing.unit,
              storeSection: ing.storeSection,
              isOptional: ing.isOptional,
              preparation: ing.preparation || null,
              recipe: { connect: { id: recipeId } },
              ingredient: { connect: { id: ingredient.id } },
            },
          });
        }
      }
    }

    // Fetch and return updated recipe
    const fullRecipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        ingredients: {
          include: {
            ingredient: true,
          },
        },
        recipeStores: {
          include: {
            store: true,
          },
        },
      },
    });

    if (!fullRecipe) {
      return sendResponse(res, 404, { error: "Updated recipe not found" });
    }

    sendResponse(res, 200, { data: fullRecipe });
  } catch (error) {
    console.error("Error updating recipe", error);
    sendResponse(res, 500, { error: "Failed to update recipe" });
  }
});

// DELETE /recipes/:id - Protected route to delete a recipe
router.delete("/:id", requireUser, async (req, res) => {
  const recipeId = parseInt(req.params.id);

  try {
    const existing = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!existing || existing.userId !== req.user.userId) {
      return sendResponse(res, 403, {
        error: "unauthorized to delete this recipe",
      });
    }

    // Delete associated RecipeIngredient entries
    await prisma.recipeIngredient.deleteMany({
      where: { recipeId },
    });

    // Delete associated RecipeStore entries (from explicit join table)
    await prisma.recipeStore.deleteMany({
      where: { recipeId },
    });

    // Now delete the recipe
    await prisma.recipe.delete({
      where: { id: recipeId },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting recipe:", error);
    sendResponse(res, 500, { error: "Failed to delete recipe" });
  }
});

// DELETE /recipes/:recipeId/ingredients/:recipeIngredientId
router.delete(
  "/:recipeId/ingredients/:recipeIngredientId",
  async (req, res) => {
    const { recipeIngredientId } = req.params;

    try {
      await prisma.recipeIngredient.delete({
        where: { id: Number(recipeIngredientId) },
      });
      res.status(200).json({ message: "Ingredient removed from recipe." });
    } catch (err) {
      console.error("Error deleting recipeIngredient:", err);
      res.status(500).json({ error: "Failed to remove ingredient." });
    }
  }
);

export default router;
