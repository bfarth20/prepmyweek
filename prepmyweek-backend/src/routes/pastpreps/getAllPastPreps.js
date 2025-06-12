import { prisma } from "../../prismaClient.js";

export const getAllPastPreps = async (req, res) => {
  try {
    const userId = req.user.userId;

    const preps = await prisma.pastPrep.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        recipes: {
          include: {
            recipe: {
              select: {
                id: true,
                title: true,
                imageUrl: true,
                prepTime: true,
                cookTime: true,
                //totalTime: true,
              },
            },
          },
        },
      },
    });

    const formatted = preps.map((prep) => ({
      id: prep.id,
      name: prep.name,
      createdAt: prep.createdAt,
      recipes: prep.recipes.map((entry) => entry.recipe),
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching past preps:", err);
    res.status(500).json({ error: "Failed to fetch past preps." });
  }
};
