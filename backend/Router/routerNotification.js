import express from "express";
import { getNotifications, markAllAsRead, clearAllNotifications } from "../controller/NotificationController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getNotifications);
router.put("/read-all", authMiddleware, markAllAsRead);
router.delete("/clear-all", authMiddleware, clearAllNotifications);

export default router;
