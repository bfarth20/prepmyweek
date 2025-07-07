import { prisma } from "../../prismaClient.js";

export async function setCurrentPrep(req, res) {
  const userId = req.user.userId;
  const { pastPrepId } = req.body;

  if (!pastPrepId) {
    return res.status(400).json({ error: "pastPrepId is required" });
  }

  try {
    const parsedPastPrepId = parseInt(pastPrepId, 10);
    if (isNaN(parsedPastPrepId)) {
      return res.status(400).json({ error: "Invalid pastPrepId" });
    }

    const pastPrep = await prisma.pastPrep.findUnique({
      where: { id: parsedPastPrepId },
      include: { recipes: true },
    });

    if (!pastPrep) {
      return res.status(404).json({ error: "Past prep not found" });
    }

    if (pastPrep.userId !== userId) {
      return res.status(403).json({ error: "Not authorized for this prep" });
    }

    // Convert recipe IDs (numbers) to strings because Prisma expects String[]
    const recipeIds = pastPrep.recipes.map((recipe) =>
      recipe.recipeId.toString()
    );

    if (recipeIds.length === 0) {
      return res
        .status(400)
        .json({ error: "Cannot set current prep with no recipes" });
    }

    const currentPrep = await prisma.currentPrep.upsert({
      where: { userId },
      update: { recipeIds },
      create: { userId, recipeIds },
    });

    res.json({
      message: "Current prep updated successfully",
      data: currentPrep,
    });
  } catch (error) {
    console.error("Error setting current prep:", error);
    res.status(500).json({ error: "Failed to set current prep" });
  }
}
