import express from "express";

import {
    createUser,
    loginUser,
    getProfile,
    getAllUsers
} from "../controllers/userController.js";

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
// =============================
// Department Assignment
// =============================

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

// =============================
// Get Managers
// =============================

router.get(
    "/managers",
    protect,
    authorize("admin"),
    getManagers
);

// =============================
// Get Employees
// =============================

router.get(
    "/employees",
    protect,
    authorize("admin"),
    getEmployees
);

// =============================
// Get Managers of Particular Department
// =============================

router.get(
    "/managers/department/:departmentId",
    protect,
    authorize("admin"),
    getManagersByDepartment
);

export default router;
