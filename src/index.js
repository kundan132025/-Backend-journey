// require {'dotenv'}.config({path: './env'})
import dotenv from "dotenv";
import ConnectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: '../.env'
})

ConnectDB()
.then(()=>{                       // Promises
    app.on("ERROR WHILE RUNNING APP: ", (error)=>{
        console.log("ERROR: ", error)
        throw error
    });
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server Is Running on ${process.env.PORT}`);      
    })
})
.catch((error)=>{
    console.log("MONGODB CONNECTION FAILED !!!!", error)
})


























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