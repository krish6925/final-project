import mongoose from "mongoose";

const userschema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password: {

            type: String,

            required: true

        },

    role:{
        type:String,
        enum:["employee","manager","admin"],
        default:"employee"
    },
    department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    default: null
},

manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
}
},
{

        timestamps: true

    }

 
);

const user=mongoose.model("user",userschema);

export default user;
