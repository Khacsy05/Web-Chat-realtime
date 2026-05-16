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