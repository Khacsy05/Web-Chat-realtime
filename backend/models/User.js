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
    },
    gender: {
        type: String,
        enum: ["Nam", "Nữ", "Khác"],
        default: "Khác"
    }, 
    avatar: {
        type: String,
        default: "/uploads/default-avatar.png"
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    lastActive: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    lastActive: {
      type: Date,
      default: null,
    },
}, {
    timestamps: true
});

export default mongoose.model("User", userSchema);