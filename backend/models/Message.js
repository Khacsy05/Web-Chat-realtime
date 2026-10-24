import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation"
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    content: {
        type: String,
        required: false
    },
    type: {
        type: String,
        enum: ["text", "image", "file", "system", "sticker"],
        default: "text"
    },
    image: {
        type: String,
        default: null
    },
    fileUrl: {
        type: String,
        default: null
    },
    fileName: {
        type: String,
        default: null
    },
    fileSize: {
        type: Number,
        default: null
    },

    status: {
        type: String,
        enum: ["sent", "delivered", "seen"],
        default: "sent"
    },
    deletedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

export default mongoose.model("Message", messageSchema);