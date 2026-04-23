import jwt from "jsonwebtoken";
import Auth from "../models/Auth.js";

export const authMiddleware = (req,res,next) => {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(404).json({message: "Token khong hop le hoac thieu"})
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY");
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token đã hết hạn" });
        }

        return res.status(401).json({ message: "Token không hợp lệ" });
    }
}