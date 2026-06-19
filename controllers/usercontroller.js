import User from "../models/user.js";

export const getusers=(req,res)=>
{
    res.send("hello");
};

export const createuser=async(req,res)=>
{
    try {
         const user=await User.create(req.body);
         res.status(201).json(user);
         console.log("done");
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"server error"});
    }
};