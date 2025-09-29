import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const fileUploadOnCloudinary = async (localfilePath) => {
    try {
        if(!localfilePath) return null

        const response = await cloudinary.uploader.upload(localfilePath,{
            resource_type : "auto"
        })
        console.log("File Uploded !!", response.url)
        return response
        
    } catch (error) {
        fs.unlinkSync(localfilePath)  // If uploading operation got fail then it will remove that file form our local storage

    }
}

export {fileUploadOnCloudinary}