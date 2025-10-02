import { ApiError } from "../Utils/ApiError.js";
import { asyncHandler } from "../Utils/asyncHandlers.js";
import { User } from "../Models/user.models.js";
import jwt from "jsonwebtoken";

export const jwtvarify = asyncHandler(async(req,res,next) => {
    try {
        // take user id by the token which set on the frontend

        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

        console.log("cookies: ", req.cookies)

        if(!token){
            throw new ApiError(401, "unauthorized request!")
        }

        const decodedToken= jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user =await User.findById(decodedToken?._id).select("-password -refreshToken")

        if(!user){
            throw new ApiError(401, "Invaild error")
        }

        req.user = user
        next()
    } catch (error) {
        throw new ApiError(400, error?.message || "Invaild access token")
    }
})