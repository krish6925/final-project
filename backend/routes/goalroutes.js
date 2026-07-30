import express from "express";

import {
    createGoal,
    getGoals,
    getGoalById,
    updateGoal,
    deleteGoal,

    approveGoal,
    rejectGoal,
    reworkGoal,

    lockGoal,

    getAllGoals

} from "../controllers/goalcontroller.js";

import protect from "../middleware/authmiddleware.js";
import authorize from "../middleware/rolemiddleware.js";

const router = express.Router();


router.post(
    "/",
    protect,
    createGoal
);


router.get(
    "/",
    protect,
    getGoals
);


// NOTE: this route must stay ABOVE "/:id" — Express matches routes in
// registration order, so "/all-goals" would otherwise be swallowed by
// the "/:id" handler (with id === "all-goals") and crash with a
// CastError from Mongoose.
router.get(
    "/all-goals",
    protect,
    authorize("manager", "admin"),
    getAllGoals
);


router.get(
    "/:id",
    protect,
    getGoalById
);


router.put(
    "/:id",
    protect,
    updateGoal
);


router.delete(
    "/:id",
    protect,
    deleteGoal
);


router.put(
    "/:id/approve",
    protect,
    authorize("manager", "admin"),
    approveGoal
);


router.put(
    "/:id/reject",
    protect,
    authorize("manager", "admin"),
    rejectGoal
);


router.put(
    "/:id/rework",
    protect,
    authorize("manager", "admin"),
    reworkGoal
);


router.put(
    "/:id/lock",
    protect,
    authorize("admin"),
    lockGoal
);

export default router;
