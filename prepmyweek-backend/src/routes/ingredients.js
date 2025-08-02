import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/suggest", async (req, res) => {
  const query = req.query.q?.trim().toLowerCase();

  if (!query || query.length < 2) {
    return res.json([]);
  }

  try {
    const results = await prisma.ingredient.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      take: 10,
      orderBy: {
        name: "asc",
      },
    });

    res.json(results.map((i) => i.name));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
