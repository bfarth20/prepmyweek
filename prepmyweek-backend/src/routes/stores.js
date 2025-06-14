import express from "express";
import { PrismaClient } from "@prisma/client";
import { requireUser } from "../middleware/authMiddleware.js";
const prisma = new PrismaClient();

const router = express.Router();

// GET /stores - minimalist store list (used by AddRecipeForm)
router.get("/", async (req, res) => {
  try {
    const stores = await prisma.groceryStore.findMany({
      select: {
        id: true,
        name: true,
        logoUrl: true, // optional, used in store cards
      },
    });
    res.status(200).json({ data: stores });
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({ error: "Failed to fetch grocery stores" });
  }
});

// GET /stores/with-recipes - detailed list for admin or dashboards
router.get("/with-recipes", async (req, res) => {
  try {
    const stores = await prisma.groceryStore.findMany({
      include: {
        recipeStore: {
          include: {
            recipe: {
              select: { id: true, title: true, course: true },
            },
          },
        },
      },
    });

    const formatted = stores.map((store) => ({
      id: store.id,
      name: store.name,
      logoUrl: store.logoUrl,
      recipes: store.recipeStore.map((rs) => rs.recipe),
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching stores with recipes:", error);
    res.status(500).json({ error: "Failed to fetch stores" });
  }
});

router.get("/:storeId/recipes", async (req, res) => {
  const storeId = parseInt(req.params.storeId);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20; // default 20 recipes per page
  const skip = (page - 1) * limit;

  try {
    // Fetch total count for pagination
    const totalCount = await prisma.recipe.count({
      where: {
        status: "approved",
        recipeStores: {
          some: { storeId },
        },
      },
    });

    // Fetch paginated recipes
    const recipes = await prisma.recipe.findMany({
      where: {
        status: "approved",
        recipeStores: {
          some: { storeId },
        },
      },
      include: {
        ingredients: {
          include: { ingredient: true },
        },
      },
      skip,
      take: limit,
    });

    const formatted = recipes.map((r) => ({
      id: r.id,
      title: r.title,
      imageUrl: r.imageUrl,
      totalTime: r.prepTime + r.cookTime,
      servings: r.servings,
      ingredientCount: r.ingredients.length,
      course: r.course,
      ingredients: r.ingredients.map((ri) => ({
        id: ri.ingredientId,
        name: ri.ingredient.name,
        quantity: ri.quantity,
        unit: ri.unit,
        storeSection: ri.storeSection,
        optional: ri.isOptional,
      })),
    }));

    res.status(200).json({
      data: formatted,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching store recipes:", error);
    res.status(500).json({ error: "Failed to fetch store recipes" });
  }
});

//POST a new store
router.post("/", requireUser, async (req, res) => {
  const { name, logoUrl } = req.body;

  try {
    const existing = await prisma.groceryStore.findUnique({
      where: { name },
    });

    if (existing) {
      return res.status(400).json({ error: "Store already exists" });
    }

    const newStore = await prisma.groceryStore.create({
      data: {
        name,
        logoUrl,
      },
    });

    res.status(201).json(newStore);
  } catch (error) {
    console.error("Error creating store:", error);
    res.status(500).json({ error: "Failed to create store" });
  }
});

// DELETE /stores/:id - Protected route to delete a store
router.delete("/:id", requireUser, async (req, res) => {
  const storeId = parseInt(req.params.id);

  try {
    const store = await prisma.groceryStore.findUnique({
      where: { id: storeId },
      include: {
        recipeStore: true,
      },
    });

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    if (store.recipeStore?.length > 0) {
      return res.status(400).json({
        error:
          "Cannot delete store that is linked to recipes. Remove associations first.",
      });
    }

    await prisma.groceryStore.delete({
      where: { id: storeId },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting store:", error);
    res.status(500).json({ error: "Failed to delete store" });
  }
});

export default router;
