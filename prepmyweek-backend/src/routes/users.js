import express from "express";
import { prisma } from "../prismaClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { requireUser } from "../middleware/authMiddleware.js";

const router = express.Router();
const SALT_ROUNDS = 10;

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Create a new user
router.post("/", async (req, res) => {
  const { email, name, password } = req.body;

  // Basic validation
  if (!name || name.trim().length < 2) {
    return res
      .status(400)
      .json({ error: "Name must be at least 2 characters long." });
  }

  if (!email || !/^[\w.-]+@[\w.-]+\.\w+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  if (!password || password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters long." });
  }

  try {
    // Check for existing email
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
      },
    });

    res.status(201).json({
      message: "User created successfully",
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
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
        //profileImageUrl: true,
        recipes: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            course: true,
            prepTime: true,
            cookTime: true,
            status: true,
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

export default router;
