import express from "express";
import { prisma } from "../prismaClient.js";
import { requireUser } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

// GET /admin/recipes/all
router.get("/recipes/all", requireUser, requireAdmin, async (req, res) => {
  try {
    const allRecipes = await prisma.recipe.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ingredients: {
          include: {
            ingredient: true,
          },
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(allRecipes);
  } catch (error) {
    console.error("Failed to fetch all recipes:", error);
    res.status(500).json({ error: "Failed to fetch all recipes" });
  }
});

// Get all pending recipes
router.get("/recipes/pending", requireUser, requireAdmin, async (req, res) => {
  try {
    const pendingRecipes = await prisma.recipe.findMany({
      where: { status: "pending" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
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
        ingredients: true,
      },
    });
    res.json(pendingRecipes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pending recipes" });
  }
});

// Approve a recipe
router.put(
  "/recipes/:id/approve",
  requireUser,
  requireAdmin,
  async (req, res) => {
    try {
      const updated = await prisma.recipe.update({
        where: { id: parseInt(req.params.id) },
        data: { status: "approved" },
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve recipe" });
    }
  }
);

// Reject (delete) a recipe
router.delete(
  "/recipes/:id/reject",
  requireUser,
  requireAdmin,
  async (req, res) => {
    try {
      await prisma.recipe.delete({
        where: { id: parseInt(req.params.id) },
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to reject recipe" });
    }
  }
);

// PUT /admin/recipes/approve-multiple
router.put(
  "/recipes/approve-multiple",
  requireUser,
  requireAdmin,
  async (req, res) => {
    const { recipeIds } = req.body; // expecting an array of numbers

    if (!Array.isArray(recipeIds) || recipeIds.length === 0) {
      return res.status(400).json({ error: "No recipe IDs provided" });
    }

    try {
      const updated = await prisma.recipe.updateMany({
        where: {
          id: { in: recipeIds },
          status: "pending",
        },
        data: {
          status: "approved",
        },
      });

      res.json({ updatedCount: updated.count });
    } catch (error) {
      console.error("Batch approve failed:", error);
      res.status(500).json({ error: "Failed to approve recipes" });
    }
  }
);

// GET /admin/stores-with-recipe-count - get all stores with recipe count
router.get(
  "/stores-with-recipe-count",
  requireUser,
  requireAdmin,
  async (req, res) => {
    try {
      const stores = await prisma.groceryStore.findMany({
        include: {
          _count: {
            select: { recipeStore: true },
          },
        },
      });

      const formatted = stores.map((store) => ({
        id: store.id,
        name: store.name,
        logoUrl: store.logoUrl,
        recipeCount: store._count.recipeStore,
      }));

      res.status(200).json(formatted);
    } catch (error) {
      console.error("Failed to fetch stores with recipe counts:", error);
      res.status(500).json({ error: "Failed to fetch stores" });
    }
  }
);

// POST /admin/stores - add a new grocery store
router.post("/stores", requireUser, requireAdmin, async (req, res) => {
  try {
    const { name, logoUrl } = req.body;

    if (!name || typeof name !== "string") {
      return res
        .status(400)
        .json({ error: "Store name is required and must be a string." });
    }

    const store = await prisma.groceryStore.create({
      data: {
        name,
        logoUrl: logoUrl || null,
      },
    });

    res.status(201).json(store);
  } catch (error) {
    console.error("Failed to create store:", error);

    if (error.code === "P2002") {
      // Prisma unique constraint violation
      return res.status(409).json({ error: "Store name already exists." });
    }

    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
