import express from "express";

import {
    createGoal,
    getGoals,
    getGoalById
} from "../controllers/goalController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createGoal);

router.get("/", protect, getGoals);

router.get("/:id", protect, getGoalById);

export default router;