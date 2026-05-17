import Conversation from "../models/Conversation.js";
import User from "../models/User.js";

export const createOrGetConversation = async (req,res) => {
    try {
        const user = await User.findOne({ userId: req.user._id });
        const { receiverId } = req.body;
        if (!receiverId) {
            return res.status(400).json({ message: "Thiếu receiverId" });
        }
        let conversation = await Conversation.findOne({
            members: { $all: [user._id, receiverId] },
            isGroup: false
        });
        if (!conversation) {
            conversation = await Conversation.create({
            members: [user._id, receiverId]
        });
        res.json(conversation);
    }
    } catch (error) {
        res.status(500).json({ message: err.message });
    }
}

export const getUserConversations = async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.user._id });

        const conversations = await Conversation.find({
            members: user._id
        })
        .populate("members", "fullname userId avatar")
        .sort({ updatedAt: -1 });

        res.json(conversations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
