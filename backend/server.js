import express from "express";

import cors from "cors";
import dotenv from "dotenv";

import router from "./routes/useroutes.js"

import connectdb from "./config/db.js";

dotenv.config();
connectdb();

const app=express();

app.use(cors());


app.use(express.json());

app.use("/api/users",router);

app.get("/",(req,res)=>
{
    res.send("helllo");
});

app.post("/user",(req,res)=>
{
    console.log(req.body);
    res.send("data recieve");
})


const port=process.env.Port || 5000;

app.listen(port,()=>{
    console.log(`server running on ${port}`);
});