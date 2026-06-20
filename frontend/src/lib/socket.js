import { io } from "socket.io-client";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const socket = io(API_BASE_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
  autoConnect: false,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});
export default socket;
