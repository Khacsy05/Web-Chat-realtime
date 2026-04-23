import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
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

        const existed = await FriendRequest.findOne({
            from,
            to,
            status: "pending"
        });

        if (existed) {
            return res.status(400).json({
                message: "Đã gửi lời mời trước đó"
            });
        }

        if (from === to) {
            return res.status(400).json({
                message: "Không thể kết bạn với chính mình"
            });
        }

        const request = new FriendRequest({
            from,
            to
        })
        
        const newRequest = await request.save();
        res.status(200).json(newRequest);
    } catch (error) {
        console.error("Loi khi goi friendRequest",error);
        res.status(500).json({message: "Loi he thong"})
    }
}