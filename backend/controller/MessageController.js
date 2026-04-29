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

    const messages = await Message.find({ conversationId })
      .populate("sender", "fullname")
      .sort({ createdAt: 1 });

    const result = messages.map(m => ({
        name: m.sender.fullname,
        content: m.content
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};