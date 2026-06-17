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
        enum: ["text", "image", "file"],
        default: "text"
    },
    image: {
        type: String,
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