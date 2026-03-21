import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const db = mongoose.connect(process.env.MONGO_URL)
.then(()=>{
   console.log("mongodb connected successfully")
})
.catch((error)=>{
    console.log("error connecting mongodb",error)
})

export default db;