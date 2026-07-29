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

import {
    assignDepartmentToManager,
    assignEmployee,
    getManagers,
    getEmployees,
    getManagersByDepartment
} from "../controllers/userController.js";

const router = express.Router();


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


router.put(
    "/assign-manager-department/:id",
    protect,
    authorize("admin"),
    assignDepartmentToManager
);

router.put(
    "/assign-employee/:id",
    protect,
    authorize("admin"),
    assignEmployee
);



router.get(
    "/managers",
    protect,
    authorize("admin"),
    getManagers
);



router.get(
    "/employees",
    protect,
    authorize("admin"),
    getEmployees
);


router.get(
    "/managers/department/:departmentId",
    protect,
    authorize("admin"),
    getManagersByDepartment
);

export default router;