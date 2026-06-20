import express from 'express';
import routerAuth from './Router/routerAuth.js';
import { connectDB } from './config/data.js';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import http from "http";
import routerUser from './Router/routerUser.js';
import { onlineUsers } from './config/socketStore.js';
import routerConversation from './Router/routerConversation.js';
import routerMessage from './Router/routerMessage.js';
import routerNotification from './Router/routerNotification.js';
import cors from "cors";
import User from './models/User.js';
dotenv.config();
const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json());
app.use("/api/auth", routerAuth);
app.use("/api/user", routerUser);
app.use("/api/conversation", routerConversation);
app.use("/api/message", routerMessage);
app.use("/api/notification", routerNotification);
app.use("/uploads", express.static("uploads"));
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST"],
  }
})



io.on("connection", (socket) => {
  // ================= ONLINE =================
  socket.on("join", async (userId) => {
    onlineUsers.set(userId, socket.id);
    await User.findByIdAndUpdate(userId, {
      isActive: true,
      lastActive: new Date(),
    });
    socket.broadcast.emit("user-status", {
      userId,
      isActive: true,
    });
    console.log("🟢 User online:", userId);
  });

  socket.on("request-online-users", () => {
    socket.emit("online-users", Array.from(onlineUsers.keys()));
  });

  // ================= ROOMS =================
  socket.on("join-conversation", (conversationId) => {
    socket.join(conversationId);
  });

  socket.on("leave-conversation", (conversationId) => {
    socket.leave(conversationId);
  });

  // ================= TYPING =================
  socket.on("typing", ({ conversationId, userId, fullname }) => {
    socket.to(conversationId).emit("typing", {
      conversationId,
      userId,
      fullname,
    });
  });

  socket.on("stop-typing", ({ conversationId, userId, fullname }) => {
    socket.to(conversationId).emit("stop-typing", {
      conversationId,
      userId,
      fullname,
    });
  });

  // ================= MESSAGE =================
  socket.on("send-message", ({ from, members, text, type, image, conversationId, messageId, name, createdAt }) => {
    if (Array.isArray(members)) {
      members.forEach((member) => {
        const memberId = typeof member === 'object' ? String(member._id) : String(member);

        if (memberId !== String(from)) {
          const receiverSocket = onlineUsers.get(String(memberId));
          if (receiverSocket) {
            io.to(receiverSocket).emit("receive-message", {
              from,
              text,
              type,       // 👈 Gửi thêm type xuống cho client nhận
              image,      // 👈 Gửi thêm image xuống cho client nhận
              conversationId,
              messageId,
              name,
              createdAt
            });
          }
        }
      });
    }
  });

  // ================= DISCONNECT =================
  socket.on("disconnect", async () => {
    let offlineUserId = null;
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        offlineUserId = userId;
        onlineUsers.delete(userId);
        break;
      }
    }
    if (offlineUserId) {
      await User.findByIdAndUpdate(offlineUserId, {
        isActive: false,
        lastActive: new Date(),
      });

      socket.broadcast.emit("user-status", {
        userId: offlineUserId,
        isActive: false,
      });

      console.log("🔴 User offline:", offlineUserId);
    }
  });
});


(async () => {
  try {
    await connectDB();             // kết nối DB
    console.log("MongoDB connected");

    server.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server + Socket chạy cổng ${process.env.PORT || 5000}`);
    });
  } catch (error) {
    console.error(error);
  }
})();


export { io };