// require {'dotenv'}.config({path: './env'})
import dotenv from "dotenv";
import ConnectDB from "./db/index.js";
import { connect } from "mongoose";

dotenv.config({
    path: '../.env'
})

ConnectDB()


























/*
one way to connect db
(async ()=>{
    try {
       await mongoose.connect(`${process.env.MONGODB_URL}/${DB_Name}`)

       app.on("error",(error)=>{
        console.log("ERROR: ",error);
        throw error
       });

       app.listen(process.env.PORT, ()  =>{
        console.log(`App Is Running On The Port: ${process.env.PORT}`);
       })
        

    } catch (error) {
        console.error("ERROR: ",error);
        throw error
    }
})()
*/