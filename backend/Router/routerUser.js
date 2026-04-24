import express from "express"
import { acceptFriend, cancelRequest, friendRequest, getAllFriend, getFriendRequest, rejectFriend } from "../controller/UserController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const routerUser = express.Router();

routerUser.use(authMiddleware)

routerUser.get("/getAllFriend",getAllFriend)
routerUser.post("/friendRequest",friendRequest)
routerUser.get("/getFriendRequest",getFriendRequest)
routerUser.post("/acceptFriend",acceptFriend)
routerUser.post("/rejectFriend",rejectFriend)
routerUser.post("/cancelRequest ",cancelRequest)

export default routerUser