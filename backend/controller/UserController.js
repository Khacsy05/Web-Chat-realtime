import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
import { io } from "../server.js";
import { onlineUsers } from "../config/socketStore.js";


export const friendRequest = async (req,res) => {
    try {
        const user = await User.findOne({ userId: req.user._id });
        const from = user._id;
        const to = req.body.to; 
        if( !to) {
            return res.status(404).json({
                message : "Vui long nhap day du thong tin"
            })
        }
        const findTo = await User.findById(to);
        if(!findTo){
            return res.status(404).json({
                message : "User khong ton tai"
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
            if(existed.status === "pending"){
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

        const socketId = onlineUsers.get(to.toString());
        if (socketId) {
            io.to(socketId).emit("friend_request", {
                from,
                message: "Bạn có lời mời kết bạn mới"
            });
        }

        res.status(200).json(newRequest);
    } catch (error) {
        console.error("Loi khi goi friendRequest",error);
        res.status(500).json({message: "Loi he thong"})
    }
}

export const getAllFriend = async (req,res) => {
    try {
        const user = await User.findOne({ userId: req.user._id });
        const relations = await FriendRequest.find({
            status: "accepted",
            $or: [{from: user._id} , {to: user._id}]
        }).populate("from to","fullname")

        if(!relations){
            return res.status(400).json({
                message : "Khong co sinh vien"
            })
        }

        const friends = relations.map(r => {
            return r.from._id.equals(user._id)
            ? r.to
            : r.from
        })

        res.status(200).json(friends)
    } catch (error) {
        console.error("Loi khi goi getAllFriend",error);
        res.status(500).json({message: "Loi he thong"})
    }
}

export const getFriendRequest = async(req,res) => {
    try {
        const user = await User.findOne({ userId: req.user._id });
        const request = await FriendRequest.find({
            to: user._id,
            status: "pending"
        }).populate("from","fullname email")
        res.json(request);
    } catch (error) {
        console.error("Loi khi goi getAllFriend",error);
        res.status(500).json({message: "Loi he thong"})
    }
}

export const acceptFriend = async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.user._id });
        const {requestId} = req.body;
        const request = await FriendRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: "Không tìm thấy request" });
        }

        if (request.to.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Không có quyền" });
        }
        request.status = "accepted";
        await request.save();

        const socketId = onlineUsers.get(from.toString());
        if (socketId) {
            io.to(socketId).emit("accept_friend", {
                to,
                message: "Da chap nhan ket ban"
            });
        }

        res.json({ message: "Đã chấp nhận kết bạn" });
    } catch (error) {
        console.error("Loi khi goi acceptFriend",error);
        res.status(500).json({message: "Loi he thong"})
    
    }
}

export const rejectFriend = async (req, res) => {
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

    request.status = "rejected";
    await request.save();

    const socketId = onlineUsers.get(from.toString());
        if (socketId) {
            io.to(socketId).emit("reject_friend", {
                to,
                message: "Da tu choi ket ban"
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

    await request.deleteOne();

    const socketId = onlineUsers.get(to.toString());
        if (socketId) {
            io.to(socketId).emit("cancel_friend", {
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
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json(err.message);
  }
};