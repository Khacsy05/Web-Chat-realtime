import Auth from "../models/Auth.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken"
import transporter from "../services/auth.service.js";
export const login = async (req,res) => {
    try {
        const {username,password} = req.body;
        if(!username && !password){
            return res.status(404).json({
                message: "vui long nhap day du email va password"
            })
        }
        const user = await Auth.findOne({username});
        if(!user){
            return res.status(404).json({
                message: "Tai khoan khong ton tai"
            })
        }
        if(password !== user.password){
            return res.status(404).json({
                message: "Mat khau khong dung"
            })
        }
        const token = jwt.sign(
            {
                _id: user._id,
                email: user.email,
                role: user.role, 
            },
            process.env.JWT_SECRET || "SECRET_KEY",
            { expiresIn: "1h" } 
        )
        res.status(200).json({
            message : "Dang nhap thanh cong",
            token
        })
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi server",
            error: error.message
        });
    }

}

export const register = async (req,res) => {
    try {
        const {username,email,password,role} = req.body;
        if(!username || !email || !password){
            return res.status(404).json({
                message: "Vui lòng cung cấp đầy đủ thông tin"
            })
        }
        const exist = await Auth.findOne({ email });
        if (exist) {
            return res.status(409).json({
                message: "Email đã tồn tại"
            });
        }
        const auth = new Auth({
            username,
            email,
            password,
            role
        });
        const newAuth = await auth.save();
        const user = new User({
            userId: newAuth._id,
            fullname: null,
            address: null,
            dateOfBirth: null
        });
        await user.save();

        return res.status(201).json({
            message: "Đăng ký thành công",
            userId: newAuth._id
        });
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi server",
            error: error.message
        });
    }
}

const otpStore = {};

export const sendOtp = async (req,res) => {
    try {
        const email = req.body.email.trim().toLowerCase();
        const otp = Math.floor(100000 + Math.random() * 900000);

        const findEmail = await Auth.findOne({email})
        if(!findEmail) {
            return res.status(404).json({
                message : "Email khong ton tai"
            })
        }

        otpStore[email] = {
            otp: otp,
            expire: Date.now() + 5 * 60 * 1000, // 5 phút
            used: false
        }
        await transporter.sendMail({
            from: "khacsy0@gmail.com",
            to: email,
            subject: "OTP xác thực",
            text: `Mã OTP của bạn là: ${otp}`,
        })

        return res.status(200).json({ message: "OTP sent" })
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi server",
            error: error.message
        });
    }
}

export const verifyOtp = async (req,res) => {
    try {
        const {email,otp} = req.body;

        
        const record = otpStore[email];

        if(!record) {
            return res.status(404).json({
                message : "Chua gui otp"
            })
        }
        if(record.used){
            return res.status(404).json({
                message : "Otp da duoc dung"
            })
        }
        if (Date.now() > record.expire) {
            return res.status(400).json({ message: "OTP hết hạn" });
        }
        if (record.otp != otp) {
            return res.status(400).json({ message: "OTP sai" });
        }
        const resetToken = jwt.sign(
            { email },
            process.env.JWT_SECRET,
            { expiresIn: "10m" }
        );
        record.used = true;

        res.status(200).json({
            message: "OTP hợp lệ",
            resetToken
        });
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi server",
            error: error.message
        });
    }
}

export const resetPass = async (req,res) => {
    try {
        const {token,newPassword} = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY");
        const email = decoded.email;

        console.log("decoded:", decoded);
        console.log("email:", decoded.email);

        const check = await Auth.findOne({ email: decoded.email });
        console.log("FOUND USER:", check);

        const user = await Auth.findOneAndUpdate(
            {email},
            {password: newPassword},
            {new:true}
        )
        if(!user){
            return res.status(404).json({
                message: "User khong ton tai"
            })
        }
        res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi server",
            error: error.message
        });1
    }
}