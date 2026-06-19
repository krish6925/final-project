import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({

    title:{
        type:String,
        required:true
    },

    description:{
        type:String,
        required:true
    },

    thrustarea:{
        type:String,
        required:true
    },

    unitofmeasurement:{
        type:String,
        required:true
    },

    target:{
        type:String,
        required:true
    },

    weightage:{
        type:Number,
        required:true
    },

    employee:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    status:{
        type:String,
        enum:[
            "pending",
            "approved",
            "rejected",
            "locked"
        ],
        default:"pending"
    },

    approvedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    isShared:{
        type:Boolean,
        default:false
    },

    parentGoal:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Goal"
    }

},{
    timestamps:true
});

const Goal = mongoose.model("Goal", goalSchema);

export default Goal;