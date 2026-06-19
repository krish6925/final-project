import mongoose from "mongoose";

const connectdb=async()=>{
    try {
        await mongoose.connect(process.env.mongo_uri);
        console.log("mongodb connected");
    } catch (error) {
        console.log(error);
        process.exit(1);
        
    }
}
export default connectdb;
