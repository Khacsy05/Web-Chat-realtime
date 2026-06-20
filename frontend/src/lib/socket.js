import { io } from "socket.io-client";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const socket = io(API_BASE_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
  autoConnect: false, // Để bạn tự control việc connect khi có user
  reconnectionAttempts: 5, // Thử kết nối lại tối đa 5 lần
  reconnectionDelay: 2000,
});
export default socket;
