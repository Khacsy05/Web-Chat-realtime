import mongoose from "mongoose";

const conversationSchema = mongoose.Schema({
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
    ],
    isGroup: {
        type: Boolean,
        default: false
    },
    // Key cố định cho chat 1-1, tránh tạo trùng khi 2 request chạy song song
    participantKey: {
        type: String,
        unique: true,
        sparse: true,
    },
    lastMessage: { type: String, default: "" },
    lastSenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
},
{
     timestamps: true
})

export default mongoose.model("Conversation", conversationSchema);