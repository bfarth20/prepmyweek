import express from "express";
import { prisma } from "../prismaClient.js";
import { requireUser } from "../middleware/authMiddleware.js";

const sendResponse = (res, status, payload) => {
  const success = status < 400;
  res.status(status).json({ success, ...payload });
};

const router = express.Router();

// GET /recipes - public route to list all recipes
router.get("/", async (req, res) => {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        ingredients: true,
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
        course: recipe.course,
        cookTime: recipe.cookTime,
        totalTime,
        numberOfIngredients: ingredientCount,
        //imageUrl: recipe.imageUrl || null, // assuming you add this field later
        // averageRating: avgRating,
        user: recipe.user,
      };
    });

    sendResponse(res, 200, { data: recipes });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    sendResponse(res, 500, { error: "Failed to fetch recipes" });
  }
});

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
        store: true,
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
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      totalTime: recipe.prepTime + recipe.cookTime,
      servings: recipe.servings,
      course: recipe.course,
      instructions: recipe.instructions,
      store: recipe.store,
      user: recipe.user,
      ingredients: recipe.ingredients.map((ri) => ({
        id: ri.ingredient.id,
        name: ri.ingredient.name,
        amount: ri.quantity,
        unit: ri.ingredient.unit,
        section: ri.ingredient.storeSection,
        optional: ri.ingredient.optional,
        substitutes: ri.ingredient.substitutes,
      })),
    };

    sendResponse(res, 200, { data: formattedRecipe });
  } catch (error) {
    console.error("Error fetching recipe:", error);
    sendResponse(res, 500, { error: "Failed to fetch recipe" });
  }
});

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
      storeId,
      ingredients = [],
    } = req.body;

    if (!title || !instructions || !Array.isArray(ingredients)) {
      return sendResponse(res, 400, {
        error:
          "Title, instructions, and a valid ingredients array are required",
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
        store: storeId ? { connect: { id: storeId } } : undefined,
        user: {
          connect: { id: req.user.userId },
        },
      },
    });

    const recipeIngredientPromises = ingredients.map(async (ing) => {
      //Checks if ingredient already exists
      let existingIngredient = await prisma.ingredient.findUnique({
        where: { name: ing.name },
      });

      if (!existingIngredient) {
        existingIngredient = await prisma.ingredient.create({
          data: { name: ing.name },
        });
      }

      // Create RecipeIngredient entry
      return prisma.recipeIngredient.create({
        data: {
          recipeId: newRecipe.id,
          ingredientId: existingIngredient.id,
          quantity: ing.amount,
          unit: ing.unit,
          section: ing.section,
          isOptional: ing.isOptional || false,
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
      },
    });

    sendResponse(res, 201, { data: fullRecipe });
  } catch (error) {
    console.error("Error creating recipe:", error);
    sendResponse(res, 500, { error: "Failed to create recipe" });
  }
});

// PUT /recipes/:id - Protected route to update a recipe
router.put("/:id", requireUser, async (req, res) => {
  const recipeId = parseInt(req.params.id);
  const { title, description, instructions, storeId } = req.body;

  try {
    //Verify that a recipe belongs to the current user
    const existing = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!existing || existing.userId !== req.user.userId) {
      return sendResponse(res, 403, {
        error: "Unauthorized to edit this recipe",
      });
    }

    if (!title || !instructions) {
      return sendResponse(res, 400, {
        error: "Title and instructions are required",
      });
    }

    const updated = await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        title,
        description,
        instructions,
        store: storeId ? { connect: { id: storeId } } : { disconnect: true },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    sendResponse(res, 200, { data: updated });
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

    await prisma.recipe.delete({
      where: { id: recipeId },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting recipe:", error);
    sendResponse(res, 500, { error: "Failed to delete recipe" });
  }
});

export default router;
