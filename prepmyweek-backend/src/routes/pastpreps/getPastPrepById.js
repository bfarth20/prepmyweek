import { prisma } from "../../prismaClient.js";
import {
  getUnitType,
  convertTbspToBestUnit,
  convertOzToBestUnit,
  pluralizeUnit,
} from "../../utils/unitConversions.js";

export const getPastPrepById = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferMetric: true },
    });

    const preferMetric = user?.preferMetric ?? false;
    const pastPrepId = parseInt(req.params.id, 10);

    const prep = await prisma.pastPrep.findFirst({
      where: {
        id: pastPrepId,
        userId,
      },
      include: {
        recipes: true,
      },
    });

    if (!prep) {
      return res.status(404).json({ error: "Prep not found." });
    }

    const recipeIds = prep.recipes.map((r) => r.recipeId);

    const recipesRaw = await prisma.recipe.findMany({
      where: { id: { in: recipeIds } },
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
    }));

    res.json({ data: { ...prep, recipes } });
  } catch (err) {
    console.error("Failed to fetch past prep:", err);
    res.status(500).json({ error: "Failed to fetch past prep." });
  }
};
