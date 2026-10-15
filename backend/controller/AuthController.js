import Auth from "../models/Auth.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken"
import transporter from "../services/auth.service.js";
import bcrypt from "bcryptjs";


export const login = async (req, res) => {
    try {
        const identifier = (req.body.username || req.body.email)?.trim();
        const password = req.body.password;
        if (!identifier || !password) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ tên đăng nhập/email và mật khẩu"
            });
        }

        // Tìm tất cả tài khoản khớp với username hoặc email (hỗ trợ trường hợp DB bị trùng username)
        const candidates = await Auth.find({
            $or: [
                { username: identifier },
                { email: identifier.toLowerCase() }
            ]
        });

        if (!candidates || candidates.length === 0) {
            return res.status(404).json({
                message: "Tài khoản không tồn tại"
            });
        }

        // Lặp kiểm tra tài khoản nào khớp mật khẩu
        let user = null;
        for (const candidate of candidates) {
            let isMatch = false;
            try {
                isMatch = await bcrypt.compare(password, candidate.password);
            } catch (err) {
                isMatch = false;
            }

            // Hỗ trợ nếu mật khẩu trong DB từng bị lưu plaintext
            if (!isMatch && password === candidate.password) {
                isMatch = true;
                candidate.password = password;
                await candidate.save();
            }

            if (isMatch) {
                user = candidate;
                break;
            }
        }

        if (!user) {
            return res.status(400).json({
                message: "Mật khẩu không đúng"
            });
        }

        const isUser = await User.findOne({ userId: user._id });
        
        // 1. Tạo Access Token (Ngắn hạn - 15 phút)
        const token = jwt.sign(
            {
                _id: user._id,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET || "SECRET_KEY",
            { expiresIn: "15m" }
        )

        // 2. Tạo Refresh Token (Dài hạn - 7 ngày)
        const refreshToken = jwt.sign(
            {
                _id: user._id,
            },
            process.env.JWT_REFRESH_SECRET || "REFRESH_SECRET_KEY",
            { expiresIn: "7d" }
        )

        // 3. Thiết lập Refresh Token Cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Chỉ HTTPS khi production
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
        });

        res.status(200).json({
            message: "Dang nhap thanh cong",
            token, // Đây chính là Access Token
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                fullname: isUser?.fullname || null,
                avatar: isUser?.avatar || "/uploads/default-avatar.png",
                idUser: isUser?._id
            }

        })
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi server",
            error: error.message
        });
    }

}

export const register = async (req, res) => {
    try {
        const { username, email, password, role, fullname } = req.body;
        if (!username || !email || !password) {
            return res.status(404).json({
                message: "Vui lòng cung cấp đầy đủ thông tin"
            })
        }
        const existEmail = await Auth.findOne({ email });
        if (existEmail) {
            return res.status(409).json({
                message: "Email đã tồn tại"
            });
        }
        const existUsername = await Auth.findOne({ username });
        if (existUsername) {
            return res.status(409).json({
                message: "Tên đăng nhập đã tồn tại, vui lòng chọn tên khác"
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
            fullname: fullname,
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

export const sendOtp = async (req, res) => {
    try {
        const email = req.body.email.trim().toLowerCase();
        const otp = Math.floor(100000 + Math.random() * 900000);

        const findEmail = await Auth.findOne({ email })
        if (!findEmail) {
            return res.status(404).json({
                message: "Email khong ton tai"
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

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;


        const record = otpStore[email];

        if (!record) {
            return res.status(404).json({
                message: "Chua gui otp"
            })
        }
        if (record.used) {
            return res.status(404).json({
                message: "Otp da duoc dung"
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

export const resetPass = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY");
        const email = decoded.email;

        console.log("decoded:", decoded);
        console.log("email:", decoded.email);

        const check = await Auth.findOne({ email: decoded.email });
        console.log("FOUND USER:", check);

        const user = await Auth.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User khong ton tai"
            });
        }
        user.password = newPassword;
        await user.save();
        res.status(200).json({ message: "Đặt lại mật khẩu thành công" });
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi server",
            error: error.message
        }); 1
    }
}

export const me = async (req, res) => {
    try {
        const authId = req.user._id; // lấy từ middleware JWT
        const user = await User.findOne({ userId: authId });
        if (!user) {
            return res.status(404).json({
                message: "User khong ton tai"
            })
        }
        res.json({
            profile: user,
        });
    } catch (err) {
        res.status(500).json(err.message);
    }
}
export const updateProfile = async (req, res) => {
    try {
        const authId = req.user._id;

        const { fullname, dateOfBirth, address, gender } = req.body;

        const updated = await User.findOneAndUpdate(
            { userId: authId },
            {
                fullname,
                dateOfBirth,
                address,
                gender,
            },
            { returnDocument: 'after' }
        );

        res.json(updated);
    } catch (err) {
        res.status(500).json(err.message);
    }
};

export const changePassword = async (req, res) => {
    try {
        const authId = req.user._id;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Vui lòng nhập mật khẩu cũ và mới" });
        }

        const authUser = await Auth.findById(authId);
        if (!authUser) {
            return res.status(404).json({ message: "Tài khoản không tồn tại" });
        }

        const isMatch = await bcrypt.compare(oldPassword, authUser.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu cũ không chính xác" });
        }

        authUser.password = newPassword;
        await authUser.save();

        return res.status(200).json({ message: "Đổi mật khẩu thành công" });
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi server",
            error: error.message
        });
    }
};

export const refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "Không tìm thấy Refresh Token" });
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "REFRESH_SECRET_KEY", async (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Refresh Token không hợp lệ hoặc đã hết hạn" });
            }

            const user = await Auth.findById(decoded._id);
            if (!user) {
                return res.status(404).json({ message: "Tài khoản không tồn tại" });
            }

            const isUser = await User.findOne({ userId: user._id });

            const token = jwt.sign(
                {
                    _id: user._id,
                    email: user.email,
                    role: user.role,
                },
                process.env.JWT_SECRET || "SECRET_KEY",
                { expiresIn: "15m" }
            );

            return res.status(200).json({
                token, // Access Token mới
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    fullname: isUser?.fullname || null,
                    avatar: isUser?.avatar || "/uploads/default-avatar.png",
                    idUser: isUser?._id
                }
            });
        });
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi server",
            error: error.message
        });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });
        return res.status(200).json({ message: "Đăng xuất thành công" });
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi server",
            error: error.message
        });
    }
};
