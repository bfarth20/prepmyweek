import express from "express";
import { createPastPrep } from "./createPastPrep.js";
import { getAllPastPreps } from "./getAllPastPreps.js";
import { getPastPrepById } from "./getPastPrepById.js";
import { deletePastPrep } from "./deletePastPreps.js";
import { requireUser } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", requireUser, createPastPrep);
router.get("/", requireUser, getAllPastPreps);
router.get("/:id", requireUser, getPastPrepById);
router.delete("/:id", requireUser, deletePastPrep);

export default router;
