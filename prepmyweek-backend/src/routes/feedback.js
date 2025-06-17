import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { requireUser, requireAdmin } from "../middleware/authMiddleware.js";

const prisma = new PrismaClient();
const router = Router();

const feedbackSchema = z.object({
  type: z.enum(["Bug", "FeatureRequest", "StoreRequest", "Other"]),
  message: z.string().min(5, "Message must be at least 5 characters long"),
});

//POST for users to submit feedback
router.post("/", requireUser, async (req, res) => {
  const parseResult = feedbackSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const { type, message } = parseResult.data;

  try {
    // Fetch full user from DB using some unique identifier from the JWT payload
    const user = await prisma.user.findUnique({
      where: { email: req.user.email },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const feedback = await prisma.feedback.create({
      data: {
        type,
        message,
        userId: user.id,
      },
    });

    res.status(201).json(feedback);
  } catch (err) {
    console.error("Error creating feedback:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//GET route admin only to get all feedback
router.get("/", requireUser, requireAdmin, async (req, res) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json(feedbacks);
  } catch (err) {
    console.error("Error fetching feedback:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//DELETE admin protected route to delete feedback
router.delete("/:id", requireUser, requireAdmin, async (req, res) => {
  const feedbackId = parseInt(req.params.id, 10);

  if (isNaN(feedbackId)) {
    return res.status(400).json({ error: "Invalid feedback ID" });
  }

  try {
    // Check if feedback exists first
    const existing = await prisma.feedback.findUnique({
      where: { id: feedbackId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    await prisma.feedback.delete({ where: { id: feedbackId } });

    res.status(204).end();
  } catch (err) {
    console.error("Error deleting feedback:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
