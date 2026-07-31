import Department from "../models/Department.js";

// Create Department
export const createDepartment = async (req, res) => {

    try {

        const { name, description } = req.body;

        const departmentExists = await Department.findOne({ name });

        if (departmentExists) {
            return res.status(400).json({
                message: "Department already exists"
            });
        }

        const department = await Department.create({
            name,
            description
        });

        res.status(201).json(department);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

// Get All Departments
export const getDepartments = async (req, res) => {

    try {

        const departments = await Department.find();

        res.status(200).json(departments);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

// Update Department
export const updateDepartment = async (req, res) => {

    try {

        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        department.name = req.body.name || department.name;

        department.description =
            req.body.description || department.description;

        await department.save();

        res.status(200).json(department);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

// Delete Department
export const deleteDepartment = async (req, res) => {

    try {

        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        await department.deleteOne();

        res.status(200).json({
            message: "Department deleted"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};