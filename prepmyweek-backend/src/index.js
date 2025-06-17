// src/index.js
import express from "express";
import cors from "cors";
import usersRouter from "./routes/users.js";
import dotenv from "dotenv";
import recipeRoutes from "./routes/recipes/index.js";
import storesRouter from "./routes/stores.js";
import currentPrepRouter from "./routes/currentPrep.js";
import pastPrepRoutes from "./routes/pastpreps/index.js";
import adminRoutes from "./routes/admin.js";
import feedbackRoutes from "./routes/feedback.js";
import forgotPasswordRouter from "./routes/forgotPassword.js";
import { ZodError } from "zod";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const baseUrl = process.env.BASE_URL || "http://localhost:3000";

app.use(
  cors({
    origin: [
      "https://prepmyweek.com",
      "https://www.prepmyweek.com",
      "http://localhost:3001", // local dev frontend
    ],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/users", usersRouter);
app.use("/api/recipes", recipeRoutes);
app.use("/api/stores", storesRouter);
app.use("/api/current-prep", currentPrepRouter);
app.use("/api/past-preps", pastPrepRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api", forgotPasswordRouter);

app.use((err, req, res, next) => {
  console.error(err); // log error for debugging

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      issues: err.errors,
    });
  }

  // fallback generic error handler
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
