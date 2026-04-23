import mongoose from "mongoose"
const authSchema = mongoose.Schema({
    
    username : {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ["admin", "user"], 
        default: "user"
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
},
{
    timestamps : true
});

const Auth = mongoose.model("Auths",authSchema);
export default Auth
