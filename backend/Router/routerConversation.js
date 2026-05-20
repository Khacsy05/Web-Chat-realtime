import express from "express"
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createOrGetConversation, getUserConversations } from "../controller/ConversationController.js";
const routerConversation = express.Router();
routerConversation.use(authMiddleware)
routerConversation.post("/createOrGetConversation", createOrGetConversation);
routerConversation.get("/getUserConversations",getUserConversations);

export default routerConversation