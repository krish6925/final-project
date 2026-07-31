import express from "express";

import protect from "../middleware/authmiddleware.js";
import authorize from "../middleware/rolemiddleware.js";

import {
    createDepartment,
    getDepartments,
    updateDepartment,
    deleteDepartment
} from "../controllers/departmentController.js";

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("admin"),
    createDepartment
);

router.get(
    "/",
    protect,
    getDepartments
);

router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateDepartment
);

router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteDepartment
);

export default router;
