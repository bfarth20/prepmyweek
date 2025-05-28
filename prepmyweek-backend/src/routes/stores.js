import express from "express";
import { PrismaClient } from "@prisma/client";
import { requireUser } from "../middleware/authMiddleware.js";
const prisma = new PrismaClient();

const router = express.Router();

//GET all stores
router.get("/", async (req, res) => {
  try {
    const stores = await prisma.groceryStore.findMany();
    res.json(stores);
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({ error: "Failed to fetch stores" });
  }
});

//POST a new store
router.post("/", requireUser, async (req, res) => {
  const { name, logoUrl } = req.body;

  try {
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

export default router;
