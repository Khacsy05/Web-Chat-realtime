import express from "express";
import {
  getNotifications,
  markAllAsRead,
  markOneAsRead,
  clearAllNotifications,
  deleteNotificationById,
} from "../controller/NotificationController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getNotifications);
router.put("/read-all", authMiddleware, markAllAsRead);
router.put("/read/:id", authMiddleware, markOneAsRead);
router.delete("/clear-all", authMiddleware, clearAllNotifications);
router.delete("/:id", authMiddleware, deleteNotificationById);

export default router;
