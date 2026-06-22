import mongoose from "mongoose"
import bcrypt from "bcryptjs";

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

// Pre-save middleware to automatically hash password
authSchema.pre("save", async function() {
    if (!this.isModified("password")) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const Auth = mongoose.model("Auths",authSchema);
export default Auth
