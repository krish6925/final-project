import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Use from "../models/user.js";
import Department from "../models/Department.js";



const generateToken = (id) => {

    return jwt.sign(

        { id },

        process.env.JWT_SECRET,

        {
            expiresIn: "30d"
        }

    );

};
export const createUser = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            role
        } = req.body;

        const userExists = await User.findOne({
            email
        });

        if (userExists) {

            return res.status(400).json({
                message: "User Already Exists"
            });

        }

        const salt = await bcrypt.genSalt(10);

        const hashedPassword =
            await bcrypt.hash(
                password,
                salt
            );

        const user = await User.create({

            name,
            email,
            password: hashedPassword,
            role: role || "employee"

        });

        res.status(201).json({

            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};
export const loginUser = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        const user = await User.findOne({
            email
        });

        if (!user) {

            return res.status(404).json({
                message: "User Not Found"
            });

        }

        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isMatch) {

            return res.status(401).json({
                message: "Invalid Credentials"
            });

        }

        res.status(200).json({

            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};
export const getProfile = async (req, res) => {

    try {

        const user = await User.findById(
            req.user._id
        ).select("-password");

        if (!user) {

            return res.status(404).json({
                message: "User Not Found"
            });

        }

        res.status(200).json(user);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};
export const getAllUsers = async (req, res) => {

    try {

        const users =
            await User.find()
                .select("-password");

        res.status(200).json(users);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
    

};
export const assignDepartmentToManager = async (req, res) => {

    try {

        const manager = await Use.findById(req.params.id);

        if (!manager) {
            return res.status(404).json({
                message: "Manager not found"
            });
        }

        if (manager.role !== "manager") {
            return res.status(400).json({
                message: "Selected user is not a manager"
            });
        }

        const department = await Department.findById(req.body.department);

        if (!department) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        manager.department = department._id;

        await manager.save();

        res.status(200).json({
            message: "Department assigned successfully",
            manager
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};
export const assignEmployee = async (req, res) => {

    try {

        const employee = await Use.findById(req.params.id);

        if (!employee) {

            return res.status(404).json({
                message: "Employee not found"
            });

        }

        if (employee.role !== "employee") {

            return res.status(400).json({
                message: "Selected user is not an employee"
            });

        }

        const department = await Department.findById(req.body.department);

        if (!department) {

            return res.status(404).json({
                message: "Department not found"
            });

        }

        const manager = await Use.findById(req.body.manager);

        if (!manager) {

            return res.status(404).json({
                message: "Manager not found"
            });

        }

        if (manager.role !== "manager") {

            return res.status(400).json({
                message: "Selected user is not a manager"
            });

        }

        if (manager.department.toString() !== department._id.toString()) {

            return res.status(400).json({
                message: "Manager does not belong to this department"
            });

        }

        employee.department = department._id;

        employee.manager = manager._id;

        await employee.save();

        res.status(200).json({
            message: "Employee assigned successfully",
            employee
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};
export const getManagers = async (req, res) => {

    try {

        const managers = await Use.find({
            role: "manager",
            isApproved: true
        })
        .populate("department", "name");

        res.status(200).json(managers);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};
export const getEmployees = async (req, res) => {

    try {

        const employees = await Use.find({
            role: "employee"
        })
        .populate("department", "name")
        .populate("manager", "name email");

        res.status(200).json(employees);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};
export const getManagersByDepartment = async (req, res) => {

    try {

        const managers = await Use.find({
            role: "manager",
            department: req.params.departmentId,
            isApproved: true
        });

        res.status(200).json(managers);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};