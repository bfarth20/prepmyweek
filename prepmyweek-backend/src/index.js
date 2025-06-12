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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:3001",
  })
);
app.use(express.json());

app.use("/api/users", usersRouter);
app.use("/api/recipes", recipeRoutes);
app.use("/api/stores", storesRouter);
app.use("/api/current-prep", currentPrepRouter);
app.use("/api/past-preps", pastPrepRoutes);
app.use("/api/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
