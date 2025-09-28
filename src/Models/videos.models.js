import mongoose, {Schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = Schema(
    {
        title : {
            type : String,
            required : true
        },
        description : {
            type : String,
            required : true
        },
        duration : {
            type : Number,  // cloudnary url
            required : true
        },
        view : {
            type : Number,
            default : 0
        },
        isPublished : {
            type : Boolean,
            default : true
        },
        videoFile : {
            type : String,  // cloudnary url
            required : true,
        },
        thumbnail : {
            type : String,    // cloudnary url
            required : true
        },
        owner : {
            type : mongoose.Schema.Types.ObjectId, 
            ref : "User"
        }
    },
    { timestamps: true }
);

mongoose.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video",videoSchema);



// mongoose-aggregate-paginate-v2  unlock true potential of the mongodb help to write aggregation pipelines