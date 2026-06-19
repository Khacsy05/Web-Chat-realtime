import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";
import { onlineUsers } from "../config/socketStore.js";
import { io } from "../server.js";


export const sendMessage = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user._id });
    const { conversationId, content } = req.body;
    const sender = user._id;
    if (!conversationId || !content) {
      return res.status(400).json({ message: "Thiếu dữ liệu" });
    }

    const message = await Message.create({
      conversationId,
      sender,
      content
    });

    // update last message conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: content,
      lastSenderId: sender,
      updatedAt: Date.now()
    });

    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const limit = Number(req.query.limit) || 20;
    const before = req.query.before;
    const user = await User.findOne({ userId: req.user._id });
    const query = {
      conversationId,
      deletedBy: { $ne: user._id } // Lọc bỏ những tin nhắn đã bị người dùng này xóa
    };

    if (before) {
      query._id = { $lt: before }; // Lấy những tin nhắn có ID nhỏ hơn cursor (cũ hơn)
    }

    // 1. ĐỔI THÀNH: Lấy limit + 1 phần tử để kiểm tra xem còn trang tiếp theo hay không
    const messages = await Message.find(query)
      .populate("sender")
      .sort({ _id: -1 })
      .limit(limit + 1);

    // 2. Kiểm tra nếu số tin nhắn lớn hơn limit thì còn dữ liệu cũ hơn
    const hasMore = messages.length > limit;
    if (hasMore) {
      messages.pop(); // Bỏ đi phần tử thứ limit + 1 dư thừa
    }

    // 3. ĐỔI THÀNH: Lấy cursor là tin nhắn CŨ NHẤT trong đợt này (phần tử cuối mảng) trước khi đảo ngược
    const nextCursor = messages.length > 0 ? messages[messages.length - 1]._id : null;

    // 4. ĐỔI THÀNH: Đảo ngược mảng để trả về thứ tự thời gian tăng dần (cũ ở trước, mới ở sau)
    // Giúp Frontend hiển thị tự nhiên từ trên xuống dưới
    messages.reverse();

    const result = messages.map(m => ({
      messageId: m._id,
      senderId: m.sender._id,
      name: m.sender.fullname,
      content: m.content,
      type: m.type || "text",
      image: m.image || null,
      createdAt: m.createdAt,
      isDeleted: m.isDeleted || false
    }));

    res.json({
      items: result,
      hasMore,
      nextCursor
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteMessageForMe = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user._id });
    const { messageId } = req.body;

    if (!messageId) {
      return res.status(400).json({ message: "Thiếu messageId" });
    }

    const message = await Message.findByIdAndUpdate(messageId, {
      $addToSet: { deletedBy: user._id }
    });

    return res.json(message);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const revokeMessage = async (req, res) => {
  try {
    const { messageId, conversationId } = req.body;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Không tìm thấy tin nhắn" });
    }

    const updated = await Message.findByIdAndUpdate(
      messageId,
      {
        content: "Tin nhắn đã được thu hồi",
        isDeleted: true
      },
      { new: true }
    );

    const conversation = await Conversation.findById(conversationId).populate("members");

    conversation.members.forEach((member) => {
      const socketId = onlineUsers.get(String(member._id));
      if (socketId) {
        io.to(socketId).emit("message-revoked", {
          messageId,
          conversationId,
          content: updated.content,
          isDeleted: true
        });
      }
    });

    return res.json(updated);

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const sendImage = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user._id });
    const { conversationId } = req.body;
    const sender = user._id;
    if (!conversationId || !req.file) {
      return res.status(400).json({ message: "Thiếu dữ liệu" });
    }
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    const message = await Message.create({
      conversationId,
      sender,
      type: "image",
      content: "[Hình ảnh]",
      image: imageUrl
    });

    // update last message conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: "[Hình ảnh]",
      lastSenderId: sender,
      updatedAt: Date.now()
    });

    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMediaArchive = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const user = await User.findOne({ userId: req.user._id });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    const messages = await Message.find({
      conversationId,
      deletedBy: { $ne: user._id },
      $or: [
        { type: "image" },
        { type: "file" },
        { type: "text", content: { $regex: "https?://" } }
      ]
    }).sort({ createdAt: -1 });
    const result = messages.map(m => ({
      messageId: m._id,
      senderId: m.sender,
      content: m.content,
      type: m.type || "text",
      image: m.image || null,
      createdAt: m.createdAt,
      isDeleted: m.isDeleted || false
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};