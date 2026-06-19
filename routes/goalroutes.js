import express from "express";
import authorize from "../middleware/roleMiddleware.js";

import {
    createGoal,
    getGoals,
    getGoalById,
    approveGoal
} from "../controllers/goalcontroller.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createGoal);

router.get("/", protect, getGoals);

router.get("/:id", protect, getGoalById);

router.put("/:id/approve", protect, approveGoal);
router.put(
    "/:id/approve",
    protect,
    authorize("manager"),
    approveGoal
);
router.put(
    "/:id/lock",
    protect,
    authorize("admin"),
    lockGoal
);
router.get(
    "/all-goals",
    protect,
    authorize("manager", "admin"),
    getAllGoals
);
router.put(
    "/:id/lock",
    protect,
    lockGoal
);

export default router;
