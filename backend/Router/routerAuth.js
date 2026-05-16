import express from "express"
import { register,login, sendOtp, verifyOtp, resetPass, me } from "../controller/AuthController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const routerAuth = express.Router();

routerAuth.post("/register",register);
routerAuth.post("/login",login);
routerAuth.post("/sendOtp",sendOtp);
routerAuth.post("/verifyOtp",verifyOtp);
routerAuth.put("/resetPass",resetPass)
routerAuth.get("/getProfile",authMiddleware,me)
export default routerAuth