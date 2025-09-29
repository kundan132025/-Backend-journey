import mongoose from "mongoose";
import {DB_Name} from "../constant.js";


const ConnectDB = async ()=>{
    try {
       const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_Name}`);
       console.log(`MONGODB CONNECTED !! DB HOST ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("MONGODB CONNECTION FAILED: ",error);
        process.exit(1);   // what is process.exit()
    }
};

export default ConnectDB;