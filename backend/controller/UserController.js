import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
import Notification from "../models/Notification.js";
import { io } from "../server.js";
import { onlineUsers } from "../config/socketStore.js";
import mongoose from "mongoose";


export const friendRequest = async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.user._id });
        const from = user._id;
        const to = req.body.to;
        if (!to) {
            return res.status(404).json({
                message: "Vui long nhap day du thong tin"
            })
        }
        const findTo = await User.findById(to);
        if (!findTo) {
            return res.status(404).json({
                message: "User khong ton tai"
            })
        }

        if (from.toString() === to.toString()) {
            return res.status(400).json({
                message: "Không thể kết bạn với chính mình"
            });
        }

        const existed = await FriendRequest.findOne({
            $or: [
                { from, to },
                { from: to, to: from }
            ]
        });


        if (existed) {
            if (existed.status === "pending") {
                return res.status(400).json({ message: "Đã gửi lời mời rồi" });
            }
            if (existed.status === "accepted") {
                return res.status(400).json({ message: "Đã là bạn bè" });
            }
            if (existed.status === "rejected") {
                existed.status = "pending";
                existed.from = from;
                existed.to = to;
                await existed.save();
            }

            return res.json({ message: "Gửi lại lời mời thành công" });
        }

        const request = new FriendRequest({
            from,
            to
        })

        const newRequest = await request.save();
        
        // Populate the from and to fields so that the frontend has user details immediately
        const populatedRequest = await FriendRequest.findById(newRequest._id)
            .populate("from", "fullname avatar isActive lastActive")
            .populate("to", "fullname avatar isActive lastActive");

        // Save Notification to Database
        await Notification.create({
            recipient: to,
            sender: from,
            type: "friend_request",
            content: `${user.fullname} đã gửi cho bạn một lời mời kết bạn`,
            relatedId: from
        });

        const socketId = onlineUsers.get(to.toString());
        if (socketId) {
            io.to(socketId).emit("friend_request", {
                request: populatedRequest,
                from: {
                    _id: user._id,
                    fullname: user.fullname,
                    avatar: user.avatar
                },
                message: `${user.fullname} đã gửi cho bạn một lời mời kết bạn`
            });
        }

        res.status(200).json(populatedRequest);
    } catch (error) {
        console.error("Loi khi goi friendRequest", error);
        res.status(500).json({ message: "Loi he thong" })
    }
}

export const getAllUser = async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.user._id });
        if (!user) {
            return res.status(400).json({
                message: "User không tồn tại"
            })
        }
        const myId = user._id;
        const relations = await FriendRequest.find({
            $or: [{ from: myId }, { to: myId }]
        });
        const excludeIds = [myId];
        relations.forEach(req => {
            if (req.from.toString() === myId.toString()) {
                excludeIds.push(req.to)
            }
            else {
                excludeIds.push(req.from)
            }
        })

        const users = await User.find({
            _id: { $nin: excludeIds }
        })
        res.status(200).json(users)
    } catch (error) {
        console.error("Lỗi khi lấy danh sách user:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
}

export const getAllFriend = async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.user._id });
        if (!user) {
            return res.status(400).json({
                message: "User không tồn tại"
            })
        }

        const limit = Number(req.query.limit) || 20;
        const after = req.query.after; // cursor

        const query = {
            status: "accepted",
            $or: [{ from: user._id }, { to: user._id }],
        };
        const dataQuery = { ...query };
        if (after) {
            dataQuery._id = { $lt: after }; // cursor pagination
        }

        const total = await FriendRequest.countDocuments(query);
        const relations = await FriendRequest.find(dataQuery)
            .sort({ _id: -1 })
            .limit(limit + 1)
            .populate("from to", "fullname avatar isActive lastActive")

        const hasMore = relations.length > limit;
        if (hasMore) relations.pop();

        if (!relations) {
            return res.status(400).json({
                message: "User không tồn tại"
            })
        }

        const friends = relations.map(r => {
            return r.from._id.equals(user._id)
                ? r.to
                : r.from
        })

        res.status(200).json({
            items: friends,
            hasMore,
            nextCursor: relations.at(-1)?._id ?? null,
            total
        })
    } catch (error) {
        console.error("Loi khi goi getAllFriend", error);
        res.status(500).json({ message: "Loi he thong" })
    }
}

export const getReceivedRequest = async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.user._id });
        const request = await FriendRequest.find({
            to: user._id,
            status: "pending"
        }).populate("from", "fullname avatar isActive lastActive")
        res.json(request);
    } catch (error) {
        console.error("Loi khi goi getReceivedFriend", error);
        res.status(500).json({ message: "Loi he thong" })
    }
}

export const getSentRequest = async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.user._id });
        const request = await FriendRequest.find({
            from: user._id,
            status: "pending"
        }).populate("to", "fullname avatar isActive lastActive")
        res.json(request);
    } catch (error) {
        console.error("Loi khi goi getSentFriend", error);
        res.status(500).json({ message: "Loi he thong" })
    }
}

export const acceptRequest = async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.user._id });
        const { requestId } = req.body;
        const request = await FriendRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: "Không tìm thấy request" });
        }

        if (request.to.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Không có quyền" });
        }
        request.status = "accepted";
        await request.save();

        // 1. Delete the incoming friend request notification from the current user's (request.to) perspective
        await Notification.deleteOne({
            recipient: user._id,
            sender: request.from,
            type: "friend_request"
        });

        // 2. Create accept notification for request.from
        await Notification.create({
            recipient: request.from,
            sender: user._id,
            type: "accept_friend",
            content: `${user.fullname} đã chấp nhận lời mời kết bạn`,
            relatedId: user._id
        });

        const socketId = onlineUsers.get(request.from.toString());
        if (socketId) {
            io.to(socketId).emit("accept_friend", {
                requestId: request._id,
                from: {
                    _id: user._id,
                    fullname: user.fullname,
                    avatar: user.avatar
                },
                message: `${user.fullname} đã chấp nhận lời mời kết bạn`
            });
        }

        res.json({ message: "Đã chấp nhận kết bạn" });
    } catch (error) {
        console.error("Loi khi goi acceptFriend", error);
        res.status(500).json({ message: "Loi he thong" })

    }
}

export const rejectRequest = async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.user._id });
        const { requestId } = req.body;

        const request = await FriendRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({ message: "Không tìm thấy request" });
        }

        if (request.to.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Không có quyền" });
        }

        // Capture IDs before deleting the request
        const fromUserId = request.from;

        await request.deleteOne();

        // 1. Delete the friend_request notification
        await Notification.deleteOne({
            recipient: user._id,
            sender: fromUserId,
            type: "friend_request"
        });

        // 2. Create reject notification
        await Notification.create({
            recipient: fromUserId,
            sender: user._id,
            type: "reject_friend",
            content: `${user.fullname} đã từ chối lời mời kết bạn`,
            relatedId: user._id
        });

        const socketId = onlineUsers.get(fromUserId.toString());
        if (socketId) {
            io.to(socketId).emit("reject_friend", {
                requestId: request._id,
                from: {
                    _id: user._id,
                    fullname: user.fullname,
                    avatar: user.avatar
                },
                message: `${user.fullname} đã từ chối lời mời kết bạn`
            });
        }

        res.json({ message: "Đã từ chối kết bạn" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


export const cancelRequest = async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.user._id });
        const { requestId } = req.body;

        const request = await FriendRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({ message: "Không tìm thấy request" });
        }

        if (request.from.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Không có quyền huỷ" });
        }

        const toUserId = request.to;

        await request.deleteOne();

        // Delete the pending friend_request notification on the recipient's end
        await Notification.deleteOne({
            recipient: toUserId,
            sender: user._id,
            type: "friend_request"
        });

        const socketId = onlineUsers.get(toUserId.toString());
        if (socketId) {
            io.to(socketId).emit("cancel_friend", {
                fromId: user._id,
                message: "Lời mời kết bạn đã bị huỷ"
            });
        }

        res.json({ message: "Đã huỷ lời mời" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.params.id });

        res.json(user);
    } catch (err) {
        res.status(500).json(err.message);
    }
};

export const updateAvatar = async (req, res) => {
    try {
        const authId = req.user._id;

        const avatarUrl = `/uploads/${req.file.filename}`;

        const updated = await User.findOneAndUpdate(
            { userId: authId },
            { avatar: avatarUrl },
            { returnDocument: 'after' }
        );

        res.json(updated);
    } catch (err) {
        res.status(500).json(err.message);
    }
};

export const unFriend = async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.user._id });
        const { friendId } = req.body; // Front-end truyền ID của người cần hủy kết bạn lên

        if (!friendId) {
            return res.status(400).json({ message: "Thiếu ID người bạn cần hủy kết bạn" });
        }

        // Tìm bản ghi kết bạn đã "accepted" giữa 2 người này (không quan trọng ai gửi trước)
        const request = await FriendRequest.findOne({
            status: "accepted",
            $or: [
                { from: user._id, to: friendId },
                { from: friendId, to: user._id }
            ]
        });

        if (!request) {
            return res.status(404).json({ message: "Không tìm thấy mối quan hệ bạn bè hợp lệ" });
        }

        // Thực hiện xóa mối quan hệ kết bạn khỏi Database
        await request.deleteOne();

        // Xác định ai là người bị hủy để bắn Socket thông báo Realtime
        const targetId = request.from.toString() === user._id.toString()
            ? request.to.toString()
            : request.from.toString();

        // Save notification to DB
        await Notification.create({
            recipient: targetId,
            sender: user._id,
            type: "unfriend",
            content: `${user.fullname} đã hủy kết bạn với bạn`,
            relatedId: user._id
        });

        const socketId = onlineUsers.get(targetId);
        if (socketId) {
            io.to(socketId).emit("unfriend_notification", {
                unfriendedBy: user._id,
                message: `${user.fullname} đã hủy kết bạn với bạn`
            });
        }

        res.status(200).json({ message: "Đã hủy kết bạn thành công" });

    } catch (err) {
        console.error("Lỗi khi gọi unfriend:", err);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const getProfileUser = async (req, res) => {
    try {
        const { userId } = req.body
        if (!userId) {
            return res.status(400).json({ message: "Thiếu thông tin ID" });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User khong ton tai"
            })
        }
        res.json({
            profile: user,
        });
    } catch (error) {
        res.status(500).json(error.message);
    }
}
