import dotenv from 'dotenv';
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

dotenv.config({path: './.env'});

async function connectToDb(){
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_DB_URL}/${DB_NAME}`);
        console.log(`\n MongoDB connected !! DB Host: ${connectionInstance.connection.host}`);
    }catch(error){
        console.error("Mongodb connection error: ", error);
        process.exit(1);
    }
}


export default connectToDb;