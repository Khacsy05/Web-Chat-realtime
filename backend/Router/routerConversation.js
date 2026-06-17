import express from "express"
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { addMember, createGroupConversation, createOrGetConversation, deleteConversation, getUserConversations, removeMember, updateAvatar, updateNameGroup } from "../controller/ConversationController.js";
import { uploads } from "../config/upload.js";
const routerConversation = express.Router();
routerConversation.use(authMiddleware)
routerConversation.post("/createOrGetConversation", createOrGetConversation);
routerConversation.get("/getUserConversations", getUserConversations);
routerConversation.post("/deleteConversation", deleteConversation);
routerConversation.put("/removeMember", removeMember);
routerConversation.put("/addMember", addMember);
routerConversation.post("/createGroupConversation", uploads.single("avatar"), createGroupConversation);
routerConversation.put("/updateAvatar", uploads.single("avatar"), updateAvatar);
routerConversation.put("/updateNameGroup", updateNameGroup);
export default routerConversation