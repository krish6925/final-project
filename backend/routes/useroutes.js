import express from "express";

import {
  createUser,
  loginUser,
  getProfile,
  getAllUsers,
  getPendingUsers,
  approveUser,
  rejectUser,
  exportAchievementReport
} from "../controllers/usercontroller.js";

import protect from "../middleware/authmiddleware.js";
import authorize from "../middleware/rolemiddleware.js";

const router = express.Router();

// Public routes
router.post(
  "/",
  createUser
);

router.post(
  "/login",
  loginUser
);


router.get(
  "/profile",
  protect,
  getProfile
);

router.get(
  "/all-users",
  protect,
  authorize("admin"),
  getAllUsers
);

router.get(
  "/pending-approvals",
  protect,
  authorize("admin"),
  getPendingUsers
);

router.get(
  "/reports/export-achievement",
  protect,
  authorize("admin"),
  exportAchievementReport
);

router.put(
  "/:id/approve",
  protect,
  authorize("admin"),
  approveUser
);

router.delete(
  "/:id/reject",
  protect,
  authorize("admin"),
  rejectUser
);

export default router;