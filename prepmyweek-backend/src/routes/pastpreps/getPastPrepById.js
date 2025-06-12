import { prisma } from "../../prismaClient.js";

export const getPastPrepById = async (req, res) => {
  try {
    const userId = req.user.userId;
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
    }));

    res.json({ data: { ...prep, recipes } });
  } catch (err) {
    console.error("Failed to fetch past prep:", err);
    res.status(500).json({ error: "Failed to fetch past prep." });
  }
};
