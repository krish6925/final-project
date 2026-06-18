import Goal from "../models/Goal.js";

export const createGoal = async (req, res) => {

    try {

        const {
            title,
            description,
            thrustarea,
            unitofmeasurement,
            target,
            weightage
        } = req.body;

        const goal = await Goal.create({

            title,
            description,
            thrustarea,
            unitofmeasurement,
            target,
            weightage,

            employee: req.user._id

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

        const goal = await Goal.findById(
            req.params.id
        );

        if (!goal) {

            return res.status(404).json({
                message: "Goal Not Found"
            });

        }

        if (
            goal.employee.toString() !==
            req.user._id.toString()
        ) {

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