import express from "express"
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getMessages, sendMessage } from "../controller/MessageController.js";

const routerMessage = express.Router();
routerMessage.use(authMiddleware)
routerMessage.post("/sendMessage",sendMessage);
routerMessage.get("/getMessage/:conversationId",getMessages);

export default routerMessage 