/**
 * Handlers for deleting recipes and individual ingredients.
 * Ensures only authorized users can delete, and handles clean-up of joins.
 */

import { prisma } from "../../prismaClient.js";

const sendResponse = (res, status, payload) => {
  const success = status < 400;
  res.status(status).json({ success, ...payload });
};

// DELETE /recipes/:id - Protected route to delete a full recipe
export const deleteRecipe = async (req, res) => {
  const recipeId = parseInt(req.params.id);

  try {
    // Check if the recipe exists and is owned by the current user
    const existing = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!existing || existing.userId !== req.user.userId) {
      return sendResponse(res, 403, {
        error: "Unauthorized to delete this recipe",
      });
    }

    // Clean up join tables first
    await prisma.recipeIngredient.deleteMany({ where: { recipeId } });
    await prisma.recipeStore.deleteMany({ where: { recipeId } });

    // Delete the actual recipe
    await prisma.recipe.delete({ where: { id: recipeId } });

    res.status(204).send(); // No content response
  } catch (error) {
    console.error("Error deleting recipe:", error);
    sendResponse(res, 500, { error: "Failed to delete recipe" });
  }
};

// DELETE /recipes/:recipeId/ingredients/:recipeIngredientId
export const deleteRecipeIngredient = async (req, res) => {
  const { recipeIngredientId } = req.params;

  try {
    await prisma.recipeIngredient.delete({
      where: { id: Number(recipeIngredientId) },
    });

    res.status(200).json({ message: "Ingredient removed from recipe." });
  } catch (error) {
    console.error("Error deleting recipeIngredient:", error);
    res.status(500).json({ error: "Failed to remove ingredient." });
  }
};
