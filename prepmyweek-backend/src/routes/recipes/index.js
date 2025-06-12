import express from "express";
import { requireUser } from "../../middleware/authMiddleware.js";
import { getAllRecipes } from "./getAllRecipes.js";
import { getRecipeById } from "./getRecipeById.js";
import { createRecipe } from "./createRecipe.js";
import { updateRecipe } from "./updateRecipe.js";
import { deleteRecipe, deleteRecipeIngredient } from "./deleteRecipe.js";

const router = express.Router();

// Public route to list all recipes
router.get("/", getAllRecipes);

// Public route to get a recipe by ID
router.get("/:id", getRecipeById);

//Create new recipe requiring user
router.post("/", requireUser, createRecipe);

//Update existing recipe
router.put("/:id", requireUser, updateRecipe);

//Delete recipe
router.delete("/:id", requireUser, deleteRecipe);

// Delete a specific ingredient from a recipe (requires login)
router.delete(
  "/:recipeId/ingredients/:recipeIngredientId",
  requireUser,
  deleteRecipeIngredient
);

export default router;
