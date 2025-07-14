import express from "express";
import { prisma } from "../prismaClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { requireUser } from "../middleware/authMiddleware.js";

const router = express.Router();
const SALT_ROUNDS = 10;

// Zod schema for user signup
const userSignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long."),
  email: z.string().email("Invalid email format."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
  region: z.string().optional(),
  preferredStore: z.string().optional(),
});

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Create a new user with Zod validation
router.post("/", async (req, res) => {
  const parseResult = userSignupSchema.safeParse(req.body);

  if (!parseResult.success) {
    const errorMessages = parseResult.error.issues.map(
      (issue) => issue.message
    );
    return res.status(400).json({ error: errorMessages.join(" ") });
  }

  const { name, email, password, region, preferredStore } = parseResult.data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await prisma.user.create({
      data: {
        email,
        name: name.trim(),
        password: hashedPassword,
        region,
        preferredStore,
      },
    });

    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        region: newUser.region,
        preferredStore: newUser.preferredStore,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// User login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("Login attempt:", req.body);

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

//GET user :id props
router.get("/me", requireUser, async (req, res) => {
  try {
    console.log("Authenticated user ID:", req.user.userId);
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        isAdmin: true,
        region: true,
        preferredStore: true,
        walkthroughEnabled: true,
        recipes: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            course: true,
            prepTime: true,
            cookTime: true,
            status: true,
            isVegetarian: true,
          },
        },
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("Error in /me route:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

//Update walkthroughEnabled setting for the current user
router.put("/walkthrough", requireUser, async (req, res) => {
  const { enabled } = req.body;

  if (typeof enabled !== "boolean") {
    return res.status(400).json({ error: "`enabled` must be a boolean." });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: { walkthroughEnabled: enabled },
      select: {
        id: true,
        walkthroughEnabled: true,
      },
    });

    res.json({
      message: "Walkthrough setting updated",
      walkthroughEnabled: updatedUser.walkthroughEnabled,
    });
  } catch (error) {
    console.error("Error updating walkthroughEnabled:", error);
    res.status(500).json({ error: "Failed to update walkthrough setting" });
  }
});

// Get current user's favorite recipes
router.get("/favorites", requireUser, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        favoriteRecipes: {
          include: {
            recipeStores: {
              include: {
                store: {
                  select: { id: true, name: true, logoUrl: true },
                },
              },
            },
            ingredients: {
              include: {
                ingredient: true,
              },
            },
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Map favoriteRecipes to match the formatted structure like getRecipeById
    const formattedFavorites = user.favoriteRecipes.map((recipe) => {
      return {
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
      };
    });

    return res.status(200).json(formattedFavorites);
  } catch (error) {
    console.error("Failed to fetch user favorites:", error);
    return res.status(500).json({ error: "Failed to fetch user favorites" });
  }
});

// Add a recipe to current user's favorites
router.post("/favorites/:recipeId", requireUser, async (req, res) => {
  const recipeId = parseInt(req.params.recipeId);

  try {
    await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        favoriteRecipes: {
          connect: { id: recipeId },
        },
      },
    });

    res.status(204).end();
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({ error: "Failed to add recipe to favorites" });
  }
});

// Remove a recipe from current user's favorites
router.delete("/favorites/:recipeId", requireUser, async (req, res) => {
  const recipeId = parseInt(req.params.recipeId);

  try {
    await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        favoriteRecipes: {
          disconnect: { id: recipeId },
        },
      },
    });

    res.status(204).end();
  } catch (error) {
    console.error("Error removing favorite:", error);
    res.status(500).json({ error: "Failed to remove recipe from favorites" });
  }
});

export default router;
