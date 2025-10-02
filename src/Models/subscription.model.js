import mongoose , {Schema, Types} from "mongoose";


const subScriptionSchema = Schema(
    {
        subscriber : {
            type : Schema.Types.ObjectId,
            ref : "User"
        },
        channel : {
            type : Schema.Types.ObjectId,
            ref : "User"

        }
    },
    { timestamps : true }
)

export const subScription = mongoose.model("subScription",subScriptionSchema)