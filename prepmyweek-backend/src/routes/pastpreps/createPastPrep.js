import { prisma } from "../../prismaClient.js";

export const createPastPrep = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, recipeIds } = req.body;

    if (!name || !Array.isArray(recipeIds) || recipeIds.length === 0) {
      return res
        .status(400)
        .json({ error: "Name and recipeIds are required." });
    }

    const newPrep = await prisma.pastPrep.create({
      data: {
        name,
        userId,
        recipes: {
          create: recipeIds.map((recipeId) => ({
            recipe: { connect: { id: recipeId } },
          })),
        },
      },
    });

    res.status(201).json(newPrep);
  } catch (err) {
    console.error("Error creating past prep:", err);
    res.status(500).json({ error: "Failed to save past prep." });
  }
};
