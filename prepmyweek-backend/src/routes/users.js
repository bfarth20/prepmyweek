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

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

// User login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

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
        /*currentPrep: {
          select: {
            id: true,
            weekStart: true,
            dinners: {
              select: { is: true, title: true },
            },
            lunches: {
              select: { id: true, title: true },
            },
            groceryListGenerated: true,
          },
        },
        savedPreps: {
          select: {
            id: true,
            weekStart: true,
            dinners: {
              select: { id: true, title: true },
            },
            lunches: {
              select: { id: true, title: true },
            },
          },
        },*/
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("Error in /me route:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

//Example protected route
router.get("/me", requireUser, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, email: true, name: true }, //exclude password
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user info" });
  }
});

export default router;
