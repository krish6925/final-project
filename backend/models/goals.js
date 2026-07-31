import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    thrustarea: {
        type: String,
        required: true
    },

    unitofmeasurement: {
        type: String,
        required: true
    },

    target: {
        type: String,
        required: true
    },

    weightage: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "rework", "locked"],
        default: "pending"
    },

    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },

    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: null
    },

    isShared: {
        type: Boolean,
        default: false
    },

    parentGoal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Goal",
        default: null
    }

}, {
    timestamps: true
});

const Goal = mongoose.model("Goal", goalSchema);

export default Goal;