import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
    conversationId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation"
    },
    sender : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["text", "image", "file"],
        default: "text"
    },

    status: {
        type: String,
        enum: ["sent", "delivered", "seen"],
        default: "sent"
    },
}, { timestamps: true })

export default mongoose.model("Message", messageSchema);