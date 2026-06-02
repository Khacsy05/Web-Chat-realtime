import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import { io } from "../server.js";
import { onlineUsers } from "../config/socketStore.js";


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
        }).populate("members");

        if (!conversation) {
            try {
                conversation = await Conversation.create({
                    members: [user._id, receiverObjectId],
                    participantKey,
                    isGroup: false,
                });
                conversation = await conversation.populate(
                    "members"
                );
            } catch (error) {
                // 2 request song song: request sau bị trùng participantKey
                if (error.code === 11000) {
                    conversation = await Conversation.findOne({
                        participantKey,
                        isGroup: false,
                    }).populate("members");
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

export const createGroupConversation = async (req,res) => {
    try {
        const user = await User.findOne({ userId: req.user._id });
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        const {nameGroup,members} = req.body
        let parsedMembers = typeof members === "string" ? JSON.parse(members) : members;

        // Thêm ID của chính người tạo nhóm vào danh sách thành viên nếu trong mảng chưa có
        if (!parsedMembers.includes(user._id.toString())) {
            parsedMembers.push(user._id);
        }
        let avatarUrl = null; 
        if (req.file) {
            avatarUrl = `/uploads/${req.file.filename}`;
        }
        const groupData = await Conversation.create({
            adminGroup: user._id,
            nameGroup: nameGroup || "Nhóm chưa đặt tên",
            members: parsedMembers,
            isGroup: true,
            avatar: avatarUrl,
        });

        const newGroup = await Conversation.findById(groupData._id).populate(
            "members"
        );
        io.emit("conversation-createGroup", groupData);
        res.status(201).json(newGroup);
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
        .populate("members")
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
export const deleteConversation = async (req,res) => {
    try {
        const { conversationId } = req.body;
        if (!conversationId) {
            return res.status(400).json({message: "Thiếu conversationId rồi bạn ơi!"} );
        }
        await Message.deleteMany({ conversationId: conversationId });
        const deletedChat = await Conversation.findByIdAndDelete(conversationId);
        if (!deletedChat) {
            return res.status(404).json({ 
                message: "Không tìm thấy cuộc trò chuyện này hoặc đã bị xóa trước đó." 
            });
        }
        if (deletedChat) {
            deletedChat.members.forEach((member) => {
        
            // 2. Lấy socketId của từng thành viên từ Map onlineUsers đã lưu ở server.js
            const userSocketId = onlineUsers.get(String(member._id));
            
            // 3. Nếu người đó đang online (có socketId), ta chỉ bắn tín hiệu riêng cho họ
            if (userSocketId) {
                // Gửi thẳng chuỗi conversationId luôn cho gọn theo ý bạn ở trên nhé
                io.to(userSocketId).emit("conversation-deleted", conversationId); 
            }
            io.emit("conversation-deleted", conversationId);
        });
        }
        // 5. Trả về phản hồi thành công cho phía Frontend
        return res.status(200).json({
            message: "Đã xóa vĩnh viễn toàn bộ tin nhắn và cuộc trò chuyện thành công!"
        });
    } catch (error) {
        console.error("Lỗi khi xóa cuộc trò chuyện:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Lỗi hệ thống, không thể xóa cuộc trò chuyện.",
            error: error.message 
        });
    }
};
export const removeMember  = async (req,res) => {
    try {
        const {conversationId ,memberId } = req.body;
        const conversation =await Conversation.findByIdAndUpdate(
            conversationId,
            {
                $pull: { members: memberId }
            },
            { new: true }
        ).populate("members");
    if (!conversation) {
      return res.status(404).json({ message: "Không tìm thấy nhóm" });
    }

    return res.status(200).json(conversation);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

