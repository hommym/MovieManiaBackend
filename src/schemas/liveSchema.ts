import mongoose,{Types} from "mongoose";



export interface Live{
    _id:Types.ObjectId
    url:string;
    title:string;
    posterUrl:string
}



// the userSchema
const liveSchema = new mongoose.Schema<Live>({
  url: {
    type: String,
    require: true,
  },
  title: {
    type: String,
    require: true,
  },
  posterUrl: {
    type: String,
    require:false
  },
});

export const LiveSchema = mongoose.model("Live", liveSchema);
