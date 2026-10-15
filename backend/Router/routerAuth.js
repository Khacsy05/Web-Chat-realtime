import express from "express"
import { register, login, sendOtp, verifyOtp, resetPass, me, updateProfile, changePassword, refresh, logout } from "../controller/AuthController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const routerAuth = express.Router();

routerAuth.post("/register", register);
routerAuth.post("/login", login);
routerAuth.post("/sendOtp", sendOtp);
routerAuth.post("/verifyOtp", verifyOtp);
routerAuth.put("/resetPass", resetPass);
routerAuth.get("/getProfile", authMiddleware, me);
routerAuth.put("/updateProfile", authMiddleware, updateProfile);
routerAuth.put("/changePassword", authMiddleware, changePassword);
routerAuth.post("/refresh", refresh);
routerAuth.post("/logout", logout);

export default routerAuth;