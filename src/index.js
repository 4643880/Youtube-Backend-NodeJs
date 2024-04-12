

import connectToDb from "./db/mongodb_client.js";
await connectToDb();







/*
BASIC APPROACH IS THE FOLLOWING

import mongoose from "mongoose";
import { DB_NAME } from "./constants";
import express from 'express';
// require('dotenv').config({path: './.env'})

const app = express();

// Using the concept of IIFE (Immediately Invoked Function Expression) (() => {})()
( async () => {
    try{
        await mongoose.connect(`${process.env.MONGO_DB_URL}/${DB_NAME}`);
        // Adding Listner on express app
        app.on("Error", (error) => {
            console.error("Error: ", error);
            throw error;
        });

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port : ${process.env.PORT}`)
        });
    }catch(error){
        console.error('Error: ', error);
        throw error;
    }
})()

*/