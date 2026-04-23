import express from 'express';
import routerAuth from './Router/routerAuth.js';
import { connectDB } from './config/data.js';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import http from "http";
import routerUser from './Router/routerUser.js';

dotenv.config();
const app = express();
app.use(express.json());
app.use("/api/auth",routerAuth);
app.use("/api/user",routerUser)
const server = http.createServer(app);

const io = new Server(server,{
  cors:{
    origin:"http://localhost:5173",
    methods: ["GET", "POST"],
  }
})

const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("🔥 Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
  socket.on("join", (userId) => {
    onlineUsers[userId] = socket.id;
    console.log("🟢 User online:", userId);
  });

  socket.on("send-message", ({ from, to, text }) => {
    console.log("📩 Message:", from, "→", to, text);

    const receiverSocket = onlineUsers[to];
    if (receiverSocket) {
      io.to(receiverSocket).emit("receive-message", {
        from,
        text
      });
    }
  });
  
});


(async () => {
  try {
    await connectDB();             // kết nối DB
    console.log("MongoDB connected");

    server.listen(5000, () => {
      console.log("🚀 Server + Socket chạy cổng 5000");
    });
  } catch (error) {
    console.error(error);
  }
})();


