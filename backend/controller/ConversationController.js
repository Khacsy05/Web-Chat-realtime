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

    if (conversation?.clearedBy?.includes(user._id)) {
      conversation = {
        ...conversation.toObject(),
        isCleared: true,
      };
    }

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

export const createGroupConversation = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user._id });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    const { nameGroup, members } = req.body
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

    // Chỉ báo cho đúng các thành viên của nhóm, và gửi payload đã populate
    // để UI có đủ member info ngay lập tức.
    newGroup.members.forEach((member) => {
      const socketId = onlineUsers.get(String(member._id));
      if (socketId) {
        io.to(socketId).emit("conversation-createGroup", newGroup);
      }
    });
    res.status(201).json(newGroup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserConversations = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user._id });
    if (!user) {
      return res.status(400).json({ message: "Không tìm thấy người dùng" });
    }

    const limit = Number(req.query.limit) || 20;
    const after = req.query.after;
    const q = req.query.q; // 👈 Hứng từ khóa tìm kiếm gửi từ ChatList (Frontend)

    // Bộ lọc mặc định: Lấy các cuộc trò chuyện mà user hiện tại tham gia
    const query = {
      members: user._id
    };

    if (after) {
      query.updatedAt = { $lt: after };
    }

    // 🔥 XỬ LÝ LOGIC TÌM KIẾM TẠI ĐÂY
    if (q) {
      // 1. Tìm các User khác có tên chứa từ khóa q (để xử lý chat 1-1)
      const matchedUsers = await User.find({
        fullname: { $regex: q, $options: 'i' }
      }).select('_id');

      const matchedUserIds = matchedUsers.map(u => u._id);

      // 2. Gom các điều kiện tìm kiếm lại bằng $or
      query.$or = [
        // Trường hợp là nhóm: Tìm theo tên nhóm (trường nameGroup) không phân biệt hoa thường
        { nameGroup: { $regex: q, $options: 'i' } },

        // Trường hợp chat 1-1: Tìm các cuộc trò chuyện mà có thành viên trùng với list user tìm thấy ở trên
        {
          isGroup: false,
          members: { $in: matchedUserIds }
        }
      ];
    }

    // Thực hiện truy vấn dữ liệu từ DB
    const conversations = await Conversation.find(query)
      .populate("members")
      .sort({ updatedAt: -1 })
      .limit(limit + 1);

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
export const deleteConversation = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user._id });
    const { conversationId } = req.body;

    if (!conversationId) {
      return res.status(400).json({ message: "Thiếu conversationId" });
    }

    const conversation = await Conversation.findById(conversationId).populate("members");

    if (!conversation) {
      return res.status(404).json({ message: "Không tìm thấy conversation" });
    }

    await Message.updateMany(
      { conversationId },
      { $addToSet: { deletedBy: user._id } }
    );

    await Conversation.findByIdAndUpdate(conversationId, {
      $addToSet: { clearedBy: user._id }
    });

    // emit realtime
    conversation.members.forEach((member) => {
      const socketId = onlineUsers.get(String(member._id));
      if (socketId) {
        io.to(socketId).emit("conversation-cleared", {
          conversationId,
        });
      }
    });

    return res.json({ success: true });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
export const removeMember = async (req, res) => {
  try {
    const { conversationId, memberId, newAdminId } = req.body;

    let conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Không tìm thấy nhóm" });
    }

    const isAdmin =
      conversation.adminGroup.toString() === memberId.toString();

    // 🔥 nếu admin bị remove → cần transfer admin
    if (isAdmin && conversation.members.length > 1) {
      if (!newAdminId) {
        return res.status(400).json({
          message: "Phải chọn trưởng nhóm mới",
        });
      }
      conversation.adminGroup = newAdminId;
    }

    // remove member
    conversation.members = conversation.members.filter(
      (m) => m._id.toString() !== memberId.toString()
    );

    // 🔥 nếu group rỗng → delete group
    if (conversation.members.length === 0) {
      await Conversation.findByIdAndDelete(conversationId);

      const socketId = onlineUsers.get(String(memberId));
      if (socketId) {
        io.to(socketId).emit("conversation-deleted", conversationId);
      }

      return res.status(200).json({ deleted: true });
    }

    await Message.updateMany(
      { conversationId },
      {
        $addToSet: { deletedBy: memberId }
      }
    );
    await conversation.save();
    await conversation.populate("members");

    const actor = await User.findOne({ userId: req.user._id });
    const target = await User.findById(memberId);

    const isSelfLeave = actor._id.toString() === memberId.toString();
    const systemText = isSelfLeave
      ? `${target.fullname} đã rời nhóm.`
      : `${actor.fullname} đã xóa ${target.fullname} khỏi nhóm.`;

    const sysMessage = await Message.create({
      conversationId,
      sender: actor._id,
      type: "system",
      content: systemText
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: systemText,
      lastSenderId: null,
      updatedAt: Date.now()
    });

    // 🔥 notify user bị kick / rời
    const kickedSocket = onlineUsers.get(String(memberId));
    if (kickedSocket) {
      io.to(kickedSocket).emit("receive-message", {
        from: actor._id,
        text: sysMessage.content,
        conversationId: String(conversationId),
        messageId: String(sysMessage._id),
        name: "Hệ thống",
        type: "system",
        createdAt: sysMessage.createdAt
      });
      io.to(kickedSocket).emit("member-removed", {
        conversationId,
      });
    }

    // 🔥 notify remaining members and send system message
    conversation.members.forEach((member) => {
      const socketId = onlineUsers.get(String(member._id));

      if (socketId) {
        io.to(socketId).emit("receive-message", {
          from: actor._id,
          text: sysMessage.content,
          conversationId: String(conversationId),
          messageId: String(sysMessage._id),
          name: "Hệ thống",
          type: "system",
          createdAt: sysMessage.createdAt
        });
        io.to(socketId).emit("member-updated", {
          conversationId,
          conversation,
        });
      }
    });

    return res.status(200).json(conversation);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const addMember = async (req, res) => {
  try {
    const { conversationId, memberIds } = req.body;

    const actor = await User.findOne({ userId: req.user._id });
    const targets = await User.find({ _id: { $in: memberIds } });
    const targetNames = targets.map(t => t.fullname).join(", ");
    const systemText = `${actor.fullname} đã thêm ${targetNames} vào nhóm.`;

    const sysMessage = await Message.create({
      conversationId,
      sender: actor._id,
      type: "system",
      content: systemText
    });

    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $addToSet: {
          members: { $each: memberIds }
        },
        lastMessage: systemText,
        lastSenderId: null,
        updatedAt: Date.now()
      },
      { returnDocument: 'after' }
    ).populate("members");

    if (!conversation) {
      return res.status(404).json({ message: "Không tìm thấy nhóm" });
    }

    // 1. Notify all members and send system message
    conversation.members.forEach(member => {
      const socketId = onlineUsers.get(String(member._id));

      if (socketId) {
        io.to(socketId).emit("receive-message", {
          from: actor._id,
          text: sysMessage.content,
          conversationId: String(conversationId),
          messageId: String(sysMessage._id),
          name: "Hệ thống",
          type: "system",
          createdAt: sysMessage.createdAt
        });
        io.to(socketId).emit("member-updated", {
          conversationId,
          conversation,
        });
      }
    });

    // 2. Notify user mới (QUAN TRỌNG)
    memberIds.forEach((id) => {
      const socketId = onlineUsers.get(String(id));

      if (socketId) {
        io.to(socketId).emit("conversation-added", conversation);
      }
    });

    return res.status(200).json(conversation);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const updateAvatar = async (req, res) => {
  try {
    const { conversationId } = req.body;

    const avatarUrl = `/uploads/${req.file.filename}`;

    const updated = await Conversation.findOneAndUpdate(
      { _id: conversationId },
      { avatar: avatarUrl },
      { returnDocument: 'after' }
    ).populate("members");
    updated.members.forEach((member) => {
      // Lấy socketId của từng thành viên dựa vào ID của họ
      const socketId = onlineUsers.get(String(member._id));

      // Nếu thành viên đó đang online, gửi tín hiệu cập nhật ảnh cho riêng họ
      if (socketId) {
        io.to(socketId).emit("group-avatar-updated", {
          conversationId: conversationId,
          avatar: avatarUrl,
        });
      }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json(err.message);
  }
};
export const updateNameGroup = async (req, res) => {
  try {
    const { conversationId, newGroupName } = req.body;

    const updated = await Conversation.findOneAndUpdate(
      { _id: conversationId },
      { nameGroup: newGroupName },
      { returnDocument: 'after' }
    ).populate("members");
    updated.members.forEach((member) => {
      // Lấy socketId của từng thành viên dựa vào ID của họ
      const socketId = onlineUsers.get(String(member._id));

      // Nếu thành viên đó đang online, gửi tín hiệu cập nhật ảnh cho riêng họ
      if (socketId) {
        io.to(socketId).emit("group-name-updated", {
          conversationId: conversationId,
          nameGroup: newGroupName
        });
      }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

export const markAsSeen = async (req, res) => {
  try {
    const { conversationId, lastSeenMessageId } = req.body;
    const user = await User.findOne({ userId: req.user._id });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Không tìm thấy cuộc trò chuyện" });
    }

    // Initialize membersReadStatus if it doesn't exist
    if (!conversation.membersReadStatus) {
      conversation.membersReadStatus = [];
    }

    const index = conversation.membersReadStatus.findIndex(
      (status) => status.userId.toString() === user._id.toString()
    );

    if (index > -1) {
      conversation.membersReadStatus[index].lastSeenMessageId = lastSeenMessageId;
      conversation.membersReadStatus[index].seenAt = Date.now();
    } else {
      conversation.membersReadStatus.push({
        userId: user._id,
        lastSeenMessageId,
        seenAt: Date.now()
      });
    }

    await conversation.save();

    // Populate members to respond with complete info
    const updatedConversation = await Conversation.findById(conversationId).populate("members");

    // Notify other online members via Socket
    updatedConversation.members.forEach((member) => {
      if (member._id.toString() !== user._id.toString()) {
        const socketId = onlineUsers.get(String(member._id));
        if (socketId) {
          io.to(socketId).emit("user-seen-update", {
            conversationId,
            userId: user._id,
            lastSeenMessageId,
            seenAt: Date.now()
          });
        }
      }
    });

    return res.status(200).json(updatedConversation);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};