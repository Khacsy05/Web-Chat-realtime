import { MessageCircle, Users } from "lucide-react";

export const MASTER_MENU = [
  // --- CHUNG ---
  { 
    title: "Trang chủ", 
    path: "/user/dashboard", // Bạn có thể sửa path linh hoạt theo logic router
    icon : MessageCircle ,
    roles: ["user"] 
  },

  { title: "Ban be",  path: "user/friend", icon : Users , roles: ["user"] },
  
]