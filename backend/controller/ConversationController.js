import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";

const buildParticipantKey = (idA, idB) =>
    [idA, idB].map((id) => String(id)).sort().join(":");

export const createOrGetConversation = async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.user._id });
        if (!user) {
            return res.status(400).json({ message: "Khong tim thay user" });
        }

        const { receiverId } = req.body;
        if (!receiverId) {
            return res.status(400).json({ message: "Thieu receiverId" });
        }

        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ message: "receiverId khong hop le" });
        }

        const receiverObjectId = new mongoose.Types.ObjectId(receiverId);
        const participantKey = buildParticipantKey(user._id, receiverObjectId);

        let conversation = await Conversation.findOne({
            participantKey,
            isGroup: false,
        }).populate("members", "fullname userId avatar");

        if (!conversation) {
            try {
                conversation = await Conversation.create({
                    members: [user._id, receiverObjectId],
                    participantKey,
                    isGroup: false,
                });
                conversation = await conversation.populate(
                    "members",
                    "fullname userId avatar"
                );
            } catch (error) {
                // 2 request song song: request sau bị trùng participantKey
                if (error.code === 11000) {
                    conversation = await Conversation.findOne({
                        participantKey,
                        isGroup: false,
                    }).populate("members", "fullname userId avatar");
                } else {
                    throw error;
                }
            }
        }

        if (!conversation) {
            return res.status(500).json({ message: "Khong tao duoc conversation" });
        }

        res.json(conversation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserConversations = async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.user._id });

        const limit = Number(req.query.limit) || 20;
        const after = req.query.after;

        const query = {
            members: user._id
        };

        if (after) {
            query.updatedAt = { $lt: after };
        }
        const conversations = await Conversation.find(query)
        .populate("members", "fullname userId avatar")
        .sort({ updatedAt: -1 })
        .limit(limit+1);

        const nextCursor = conversations.length
        ? conversations[conversations.length - 1].updatedAt
        : null;

        const hasMore = conversations.length > limit;
        if (hasMore) conversations.pop();
        
        res.json({
            items: conversations,
            hasMore,
            nextCursor
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
