import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auths",
            required: true,
            unique: true
    },
    fullname: {
        type: String,
        default: null
    },
    address: {
        type: String,
        default: null
    },
    dateOfBirth: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

export default mongoose.model("User", userSchema);