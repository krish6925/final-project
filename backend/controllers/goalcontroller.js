import Goal from "../models/goals.js";




export const createGoal = async (req, res) => {

    try {
        const employee = req.user;

// Check if employee is assigned to a department
if (!employee.department) {
    return res.status(400).json({
        message: "Department not assigned. Contact Admin."
    });
}

// Check if employee is assigned to a manager
if (!employee.manager) {
    return res.status(400).json({
        message: "Manager not assigned. Contact Admin."
    });
}

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
}).populate("employee", "name");

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

      const goal = await Goal.findById(req.params.id).populate("employee");

if (!goal) {

    return res.status(404).json({
        message: "Goal not found"
    });

}

// Check whether this employee belongs to the logged-in manager
if (
    goal.employee.manager.toString() !== req.user._id.toString()
) {

    return res.status(403).json({
        message: "You are not authorized to approve this goal."
    });

}

goal.status = "approved";
goal.approvedBy = req.user._id;

await goal.save();

res.status(200).json(goal);

        

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

        // Admin can see every goal
        if (req.user.role === "admin") {

            const goals = await Goal.find()
                .populate("employee", "name department");

            return res.status(200).json(goals);

        }

        // Manager sees only goals of employees assigned to him
        if (req.user.role === "manager") {

            const goals = await Goal.find()
                .populate("employee");

            const filteredGoals = goals.filter(goal =>
                goal.employee.manager &&
                goal.employee.manager.toString() === req.user._id.toString()
            );

            return res.status(200).json(filteredGoals);

        }

        return res.status(403).json({
            message: "Access Denied"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};