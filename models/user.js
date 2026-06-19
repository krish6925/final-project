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
    role:{
        type:String,
        enum:["employee","manager","admin"],
        default:"employee"
    }
});

const user=mongoose.model("user",userschema);

export default user;
