import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";

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

    const query = { conversationId };

    if (before) {
      query._id = { $lt: before }; // Lấy những tin nhắn có ID nhỏ hơn cursor (cũ hơn)
    }

    // 1. ĐỔI THÀNH: Lấy limit + 1 phần tử để kiểm tra xem còn trang tiếp theo hay không
    const messages = await Message.find(query)
      .populate("sender", "fullname userId avatar")
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
        senderId : m.sender.userId,
        name: m.sender.fullname,
        content: m.content
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