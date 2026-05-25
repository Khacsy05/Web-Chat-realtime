import { UserMinus, UserPlus, Users } from "lucide-react";

export const FRIEND_MENU = [
  // --- CHUNG ---
  { title: "Danh sách bạn bè",  path: "allFriend", icon : Users , roles: ["user"] },
  { title: "Thêm bạn bè ",  path: "addFriend", icon : UserPlus , roles: ["user"] },
  { title: "Lời mời kết bạn ",  path: "pendingRequest", icon : UserMinus , roles: ["user"] },
]