import express from "express"
import { acceptFriend, cancelRequest, friendRequest, getAllFriend, getFriendRequest, rejectFriend, updateAvatar } from "../controller/UserController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { uploads } from "../config/upload.js";


const routerUser = express.Router();

routerUser.use(authMiddleware)

routerUser.get("/getAllFriend",getAllFriend)
routerUser.post("/friendRequest",friendRequest)
routerUser.get("/getFriendRequest",getFriendRequest)
routerUser.post("/acceptFriend",acceptFriend)
routerUser.post("/rejectFriend",rejectFriend)
routerUser.post("/cancelRequest ",cancelRequest)
routerUser.put("/updateAvatar", uploads.single("avatar"), updateAvatar);
export default routerUser
