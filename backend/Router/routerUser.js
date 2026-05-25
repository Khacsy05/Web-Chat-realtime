import express from "express"
import { acceptRequest, cancelRequest, friendRequest, getAllFriend, getAllUser, getProfileUser, getReceivedRequest, getSentRequest, rejectRequest, unFriend, updateAvatar } from "../controller/UserController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { uploads } from "../config/upload.js";


const routerUser = express.Router();

routerUser.use(authMiddleware)

routerUser.get("/getAllFriend",getAllFriend)
routerUser.get("/getAllUser",getAllUser)
routerUser.post("/friendRequest",friendRequest)
routerUser.get("/getReceivedRequest",getReceivedRequest)
routerUser.get("/getSentRequest",getSentRequest)
routerUser.post("/acceptRequest",acceptRequest)
routerUser.post("/rejectRequest",rejectRequest)
routerUser.post("/getProfileUser",getProfileUser)
routerUser.post("/unFriend",unFriend)
routerUser.post("/cancelRequest",cancelRequest)
routerUser.put("/updateAvatar", uploads.single("avatar"), updateAvatar);
export default routerUser
