// src/index.js
import express from "express";
import cors from "cors";
import usersRouter from "./routes/users.js";
import dotenv from "dotenv";
import recipeRoutes from "./routes/recipes.js";
import storesRouter from "./routes/stores.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/users", usersRouter);
app.use("/api/recipes", recipeRoutes);
app.use("/api/stores", storesRouter);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
