import express from "express";
import { PrismaClient } from "@prisma/client";
import { requireUser } from "../middleware/authMiddleware.js";

const router = express.Router();
const prisma = new PrismaClient();

// GET /current-prep
router.get("/", requireUser, async (req, res) => {
  try {
    const userId = req.user.userId;

    const currentPrep = await prisma.currentPrep.findUnique({
      where: { userId },
    });

    if (!currentPrep) {
      return res.status(404).json({ error: "No current prep found" });
    }

    const intIds = currentPrep.recipeIds.map((id) => parseInt(id, 10));

    const recipesRaw = await prisma.recipe.findMany({
      where: { id: { in: intIds } },
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

    const recipes = recipesRaw.map((recipe) => ({
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
      stores: recipe.recipeStores.map((rs) => ({
        id: rs.store.id,
        name: rs.store.name,
        logoUrl: rs.store.logoUrl,
      })),
      user: recipe.user,
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
      ingredientCount: recipe.ingredients.length,
    }));

    res.json({ data: { ...currentPrep, recipes } });
  } catch (error) {
    console.error("Failed to fetch current prep:", error);
    res.status(500).json({ error: "Failed to fetch current prep" });
  }
});

//POST /current-prep
router.post("/", requireUser, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { recipeIds } = req.body;

    if (!Array.isArray(recipeIds) || recipeIds.length === 0) {
      return res
        .status(400)
        .json({ error: "recipeIds must be a non-empty array" });
    }

    //Upsert the current prep for the user
    const currentPrep = await prisma.currentPrep.upsert({
      where: { userId },
      update: {
        recipeIds,
      },
      create: {
        userId,
        recipeIds,
      },
    });

    res.status(200).json({ data: currentPrep });
  } catch (error) {
    console.error("Failed to save current prep:", error);
    res.status(500).json({ error: "Failed to save current prep" });
  }
});

// DELETE /current-prep
router.delete("/", requireUser, async (req, res) => {
  try {
    const userId = req.user.userId;

    await prisma.currentPrep.delete({ where: { userId } });

    res.status(204).send();
  } catch (error) {
    console.error("Failed to delete current prep:", error);
    res.status(500).json({ error: "Failed to delete current prep" });
  }
});

export default router;
