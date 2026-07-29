import Goal from "../models/goals.js";

export const createGoal = async (req, res) => {
    try {

        const {
            title,
            description,
            thrustarea,
            unitofmeasurement,
            target,
            weightage,
            isShared,
            parentGoal
        } = req.body;

        const goal = await Goal.create({

            title,
            description,
            thrustarea,
            unitofmeasurement,
            target,
            weightage,

            employee: req.user._id,

            isShared: isShared || false,

            parentGoal: parentGoal || null

        });

        res.status(201).json(goal);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};


export const getGoals = async (req, res) => {

    try {

        const goals = await Goal.find({

            employee: req.user._id

        });

        res.status(200).json(goals);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};



export const getGoalById = async (req, res) => {

    try {

        const goal = await Goal.findById(req.params.id);

        if (!goal) {

            return res.status(404).json({
                message: "Goal Not Found"
            });

        }

        if (goal.employee.toString() !== req.user._id.toString()) {

            return res.status(403).json({
                message: "Access Denied"
            });

        }

        res.status(200).json(goal);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};



export const updateGoal = async (req, res) => {

    try {

        const goal = await Goal.findById(req.params.id);

        if (!goal) {

            return res.status(404).json({
                message: "Goal Not Found"
            });

        }

        if (goal.employee.toString() !== req.user._id.toString()) {

            return res.status(403).json({
                message: "Access Denied"
            });

        }

        if (goal.status === "locked") {

            return res.status(400).json({
                message: "Locked Goals Cannot Be Edited"
            });

        }

        const updatedGoal = await Goal.findByIdAndUpdate(

            req.params.id,

            req.body,

            {
                new: true,
                runValidators: true
            }

        );

        res.status(200).json(updatedGoal);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};


export const deleteGoal = async (req, res) => {

    try {

        const goal = await Goal.findById(req.params.id);

        if (!goal) {

            return res.status(404).json({
                message: "Goal Not Found"
            });

        }

        if (goal.employee.toString() !== req.user._id.toString()) {

            return res.status(403).json({
                message: "Access Denied"
            });

        }

        if (goal.status === "locked") {

            return res.status(400).json({
                message: "Locked Goals Cannot Be Deleted"
            });

        }

        await goal.deleteOne();

        res.status(200).json({
            message: "Goal Deleted Successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};



export const approveGoal = async (req, res) => {

    try {

        const goal = await Goal.findById(req.params.id);

        if (!goal) {

            return res.status(404).json({
                message: "Goal Not Found"
            });

        }

        if (goal.status === "locked") {

            return res.status(400).json({
                message: "Goal Already Locked"
            });

        }

        goal.status = "approved";

        goal.approvedBy = req.user._id;

        await goal.save();

        res.status(200).json({

            message: "Goal Approved",

            goal

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            message: "Server Error"

        });

    }

};



export const rejectGoal = async (req, res) => {

    try {

        const goal = await Goal.findById(req.params.id);

        if (!goal) {

            return res.status(404).json({
                message: "Goal Not Found"
            });

        }

        if (goal.status === "locked") {

            return res.status(400).json({
                message: "Goal Already Locked"
            });

        }

        goal.status = "rejected";

        goal.approvedBy = req.user._id;

        await goal.save();

        res.status(200).json({

            message: "Goal Rejected",

            goal

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            message: "Server Error"

        });

    }

};


export const reworkGoal = async (req, res) => {

    try {

        const goal = await Goal.findById(req.params.id);

        if (!goal) {

            return res.status(404).json({
                message: "Goal Not Found"
            });

        }

        if (goal.status === "locked") {

            return res.status(400).json({
                message: "Goal Already Locked"
            });

        }

        goal.status = "rework";

        goal.approvedBy = req.user._id;

        await goal.save();

        res.status(200).json({

            message: "Goal Returned For Rework",

            goal

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            message: "Server Error"

        });

    }

};



export const lockGoal = async (req, res) => {

    try {

        const goal = await Goal.findById(req.params.id);

        if (!goal) {

            return res.status(404).json({
                message: "Goal Not Found"
            });

        }

        goal.status = "locked";

        await goal.save();

        res.status(200).json({

            message: "Goal Locked Successfully",

            goal

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            message: "Server Error"

        });

    }

};



export const getAllGoals = async (req, res) => {

    try {

        const goals = await Goal.find()

            .populate(
                "employee",
                "name email role"
            )

            .populate(
                "approvedBy",
                "name email"
            );

        res.status(200).json(goals);

    } catch (error) {

        console.log(error);

        res.status(500).json({

            message: "Server Error"

        });

    }

};