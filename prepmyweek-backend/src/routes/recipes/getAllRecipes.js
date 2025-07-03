import { prisma } from "../../prismaClient.js";

// Helper to standardize API responses
const sendResponse = (res, status, payload) => {
  const success = status < 400;
  res.status(status).json({ success, ...payload });
};

// Handler for GET /recipes - fetches and formats all recipe summaries
export const getAllRecipes = async (req, res) => {
  const { vegetarian } = req.query;

  try {
    // Fetch recipes with user and store info, and ingredients to count them
    const recipes = await prisma.recipe.findMany({
      where: {
        ...(vegetarian === "true" && { isVegetarian: true }),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        ingredients: true, // Only used to count ingredients per recipe
        recipeStores: {
          include: {
            store: {
              select: { id: true, name: true, logoUrl: true },
            },
          },
        },
      },
    });

    // Format recipe data for public display
    const formatted = recipes.map((recipe) => {
      return {
        id: recipe.id,
        title: recipe.title,
        imageUrl: recipe.imageUrl,
        course: recipe.course,
        cookTime: recipe.cookTime,
        totalTime: (recipe.prepTime || 0) + (recipe.cookTime || 0), // Safely calculate totalTime
        numberOfIngredients: recipe.ingredients.length,
        isVegetarian: recipe.isVegetarian,
        user: recipe.user,
        stores: recipe.recipeStores.map((rs) => rs.store),
      };
    });

    sendResponse(res, 200, { data: formatted });
  } catch (error) {
    console.error("[GET /recipes] Failed to fetch recipes:", error);
    sendResponse(res, 500, { error: "Failed to fetch recipes" });
  }
};
