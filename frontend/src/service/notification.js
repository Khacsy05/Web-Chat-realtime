import api from "@/lib/axios";

const notificationService = {
  getNotifications: async () => {
    try {
      const response = await api.get("/notification");
      return response;
    } catch (error) {
      throw error.response || { message: "Lỗi khi lấy thông báo" };
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await api.put("/notification/read-all");
      return response;
    } catch (error) {
      throw error.response || { message: "Lỗi khi đánh dấu đã đọc" };
    }
  },

  clearAll: async () => {
    try {
      const response = await api.delete("/notification/clear-all");
      return response;
    } catch (error) {
      throw error.response || { message: "Lỗi khi xóa thông báo" };
    }
  }
};

export default notificationService;
