import express from "express";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import sendResetEmail from "../utils/sendEmail.js";

const router = express.Router();
const prisma = new PrismaClient();

// POST /forgot-password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // To prevent email enumeration, return success even if user not found
      return res.json({
        message:
          "If an account exists for this email, a reset link will be sent.",
      });
    }

    // Generate token & expiry (e.g., 15 minutes)
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // Save token in DB
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // Log reset link (replace with email sending later)
    const resetLink = `${process.env.BASE_URL}/reset-password?token=${token}`;
    await sendResetEmail(email, resetLink);

    res.json({
      message:
        "If an account exists for this email, a reset link will be sent.",
    });
  } catch (error) {
    console.error("Error in forgot-password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//POST reset-password
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res
      .status(400)
      .json({ error: "Token and new password are required." });
  }

  try {
    // Find the token record, including user
    const resetTokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetTokenRecord) {
      return res.status(400).json({ error: "Invalid or expired token." });
    }

    if (resetTokenRecord.expiresAt < new Date()) {
      // Token expired, delete it
      await prisma.passwordResetToken.delete({ where: { token } });
      return res.status(400).json({ error: "Token has expired." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    await prisma.user.update({
      where: { id: resetTokenRecord.userId },
      data: { password: hashedPassword },
    });

    // Delete the token after successful reset
    await prisma.passwordResetToken.delete({ where: { token } });

    res.json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Error in reset-password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
