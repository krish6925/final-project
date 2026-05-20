import express from "express";

import {getusers,createuser} from "../controllers/usercontroller.js";

const router=express.Router();

router.get("/",getusers);

router.post("/",createuser);
export default router


//mongodb://krishbhalotia9876_db_user:<db_password>@ac-2yp3qap-shard-00-00.x6nywdx.mongodb.net:27017,ac-2yp3qap-shard-00-01.x6nywdx.mongodb.net:27017,ac-2yp3qap-shard-00-02.x6nywdx.mongodb.net:27017/?ssl=true&replicaSet=atlas-fswdtj-shard-0&authSource=admin&appName=progress