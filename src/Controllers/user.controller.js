import {asyncHandler} from "../Utils/asyncHandlers.js"
import {ApiError} from "../Utils/ApiError.js"
import {User} from "../Models/user.models.js"
import {fileUploadOnCloudinary} from "../Utils/cloudinary.js"
import { ApiResponse } from "../Utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefereshToken = async(userId)=> {                              //here we are not use the asyncHandler because we are not handling any webrequest it is our internal method
    try {
        const user =await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        return { accessToken, refreshToken }
        
    } catch (error) {
        throw new ApiError(500, "Somthing Went Wrong")
    }
}

const registerUser = asyncHandler( async(req, res) => {
    const {fullname, username, email, password}= req.body

    if (
        [fullname, username, email, password].some((field) => field?.trim() === "" )
    ) {
        throw new ApiError(400, "All Fields Are Required")
    }
    
    const exitedUser= await User.findOne({
        $or : [{username},{email}]
    })

    if (exitedUser) {
        throw new ApiError(409,"User Already Exit")
    }
        
    const avatarLocalPath = req.files.avatar[0].path
    // const coverImageLocalPath= req.files.coverImage[0].path   

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    
    const avatar = await fileUploadOnCloudinary(avatarLocalPath)
    const coverImage = await fileUploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar upload failed")
    }

    // Fix: Store the created user in a variable
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase() 
    })
    
    // Fix: Use user._id instead of User._id
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something Went Wrong While Creating User")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )
})

const loginUser = asyncHandler(async(req,res)=> {
    // take data from req.body
    // check email and username
    // check is user exit or not
    // check password 
    // generate accesstoken and refersh token
    // send cookies

    const {email, username, password } = req.body;

    if (!username && !email){
        throw new ApiError(400, "username or password is required")
    }

    const user = await User.findOne({
        $or : [{username},{email}]   // Here $or --> these are mongoodb operators
    })

    if(!user){
        throw new ApiError(404, "user does not exit")    // 404 --> beacuse nothing found
    }
    const passwordvaildation =await user.isPasswordCorrect(password)         // don't access the method using User beacuse it is mongo user your user is {user} if your using and mongodb quary then use {User} this is object of mongo therefor and to apply your own methods use {user} your are taking the instance of the of mongo object
    if(!passwordvaildation){
        throw new ApiError(401, "invaild password credintial")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshToken(user._id)

    // To generate cookies you need fields from user that is not big deal you can take it from the user which is decleared first and after that we generate the refershtoken so in the user refershtoken is empty so to tackle this we can update the user or use database quary so here we have to decide which opereation is less costly

    const loggedInUser = await User.findById(user._id).select(" -password -refreshToken")
    
    // To sending cookies we have to decide some options(that is object) of cookies for the better security

    const options = {
        httpOnly : true,
        secure : true       // these two options are user to secure the cookies by modify on the frontend using these option cookies is only visible on frontend we can't modify. Modification are only happen on the server
    }
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken",refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
               user : loggedInUser, accessToken, refreshToken
            },
            "User loggedIn Successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req,res) => {
    await User.findByIdAndUpdate(
        req.user._id, 
        {
            $set: {
                refreshToken : undefined
            } 
        },
        {
            new : true
        }
    )
    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200, {}, "User Logged Out"))

})

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized Request")
    }

    try {
        const decodedIncomingToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedIncomingToken?._id)
    
        if(!user){
            throw new ApiError(401, "Invaild Referesh token")
        }
    
        if(user.refreshToken !== decodedIncomingToken){
            throw new ApiError(401, "Invaild Referesh token")
        }
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        const {newRefershtoken, accessToken}= await generateAccessAndRefereshToken(user._id)
    
        return res
        .status(200)
        .cookie("accesToken",accessToken, options)
        .cookie("refreshToken", newRefershtoken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken, refreshToken : newRefershtoken,
                },
                "AccessToken refreshed successfully"

            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invaild refresh token")
    }


    
})

const changeCurrentPassword = asyncHandler(async(req,res) =>{
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw ApiError(400,"Invaild Password")
    }
    user.password = newPassword
    await user.save({validateBeforeSave : false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Succesfully"))

})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(200, req.user, "Current User Fetched Succesfully")
})

const updateAccountDetails = asyncHandler(async(req,res) => {
    const {fullname, email} =req.body

    if (!fullname || !email) {
        throw ApiError(401, "All Fields Are Required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email
            }
        },
        {new: true}
    ).select(" -password")
    return res.status(200).json(new ApiResponse(200, {},"Account Details updated succesfully"))
})

const updateUserAvatar = asyncHandler(async(req,res) => {
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar File Is Missing")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar.url){
        throw new ApiError(400, "Avatar file is missing")
    }
    const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
        $set : {
            avatar: avatar.url
        }
    },
    {new : true}
   ).select(" -password")

   return res.status(200).json(new ApiResponse(200, user, "Update User Data Succesfully"))
})

const updateUsersCoverImage = asyncHandler(async(req,res) => {
    const coverLocalPath = req.file?.path
    if(!coverLocalPath){
        throw new ApiError(400, "coverImage File Is Missing")
    }
    const coverImage = await uploadOnCloudinary(coverLocalPath)
    if (!coverImage.url){
        throw new ApiError(400, "coverImage file is missing")
    }
    const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
        $set : {
            avatar: coverImage.url
        }
    },
    {new : true}
   ).select(" -password")

   return res.status(200).json(new ApiResponse(200, user, "Update User Data Succesfully"))
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUsersCoverImage
}