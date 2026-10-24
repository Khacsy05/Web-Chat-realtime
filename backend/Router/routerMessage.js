import express from "express"
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { deleteMessageForMe, getMessages, getMediaArchive, revokeMessage, sendFile, sendImage, sendMessage } from "../controller/MessageController.js";
import { uploads } from "../config/upload.js";

const routerMessage = express.Router();
routerMessage.use(authMiddleware)
routerMessage.post("/sendMessage", sendMessage);
routerMessage.get("/getMessage/:conversationId", getMessages);
routerMessage.post("/deleteMessageForMe", deleteMessageForMe);
routerMessage.post("/revokeMessage", revokeMessage);
routerMessage.post("/sendImage", uploads.single("image"), sendImage);
routerMessage.post("/sendFile", uploads.single("file"), sendFile);
routerMessage.get("/getMediaArchive/:conversationId", getMediaArchive);
export default routerMessage 