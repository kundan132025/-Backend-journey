import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { use } from "react";

const userSchema = new Schema(
    {
        username : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
            index : true    // enable serching in db
        },
        fullname : {
            type : String,
            required : true,
            trim : true,
            index : true
        },
        email : {
            type : String,
            required : true,
            unique : true     
        },
        password : {
            type : String,   // why we store password in the string we should store it in the encrypted format
            required : [true, "password is required"],
            unique : true
        },
        avatar : {
            type : String,   // cloudnary url
            required : true
        },
        coverImage :{
            type : String
        },
        watchHistory : [
            {
            type : Schema.Types.ObjectId,
            ref : "Video"
            }
        ]
    },

    {timestamps : true}


);

userSchema.pre("save", function(next) {
    if(!this.isModified("password")) return next()

    this.password = bcrypt.hash("password",10)
    next()
})

userSchema.method.isPasswordCorrect = async function (password) {
    return await bcrypt.compare("password",this.password)
}


userSchema.method.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id : this._id,
            username : this.username,
            email : this.email,
            fullname : this. fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
    
}

userSchema.method.generateRefreshToken = async function () {
    return jwt.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema);

 // here don't write like () => {} because arrow function has no context
