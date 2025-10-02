import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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
            required : [true, "password is required"]
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
        ],
        refreshToken : {
            type : String
        }
    },

    {timestamps : true}


);

userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next()

    this.password = await bcrypt.hash("password",10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare("password", this.password)
}


userSchema.methods.generateAccessToken =  function () {        // Here intially i wrote async so problem i faced is beacuse of async it return promises and when these promises goes into the .cookies it got converted into the {} therefor it not set cookie in browser
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

userSchema.methods.generateRefreshToken =  function () {
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
