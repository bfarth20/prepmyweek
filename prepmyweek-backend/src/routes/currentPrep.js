import express from "express";
import { PrismaClient } from "@prisma/client";
import { requireUser } from "../middleware/authMiddleware.js";
import {
  getUnitType,
  convertTbspToBestUnit,
  convertOzToBestUnit,
  pluralizeUnit,
} from "../utils/unitConversions.js";

const router = express.Router();
const prisma = new PrismaClient();

// GET /current-prep
router.get("/", requireUser, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        preferMetric: true,
      },
    });

    const preferMetric = user?.preferMetric ?? false;

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
      ingredients: recipe.ingredients.map((ri) => {
        const { id, name } = ri.ingredient;

        // Use normalizedQuantity/unit if present, else fallback to original
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
          quantity: ri.quantity, // original raw quantity
          unit: ri.unit, // original raw unit
          displayQuantity,
          displayUnit: displayQuantity
            ? pluralizeUnit(displayUnit, displayQuantity)
            : displayUnit,
          formattedQuantity:
            displayQuantity && displayUnit
              ? `${displayQuantity} ${pluralizeUnit(displayUnit, displayQuantity)}`
              : null,
          storeSection: ri.storeSection,
          isOptional: ri.isOptional,
          preparation: ri.preparation,
        };
      }),
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
