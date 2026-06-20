import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const getNotifications = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user._id });
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    const list = await Notification.find({ recipient: user._id })
      .populate("sender", "fullname avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json(list);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user._id });
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    await Notification.updateMany({ recipient: user._id }, { isRead: true });

    return res.status(200).json({ success: true, message: "Đã đọc tất cả thông báo" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

export const clearAllNotifications = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user._id });
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    await Notification.deleteMany({ recipient: user._id });

    return res.status(200).json({ success: true, message: "Đã xóa toàn bộ thông báo" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
