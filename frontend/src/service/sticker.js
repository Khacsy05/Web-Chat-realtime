import api from "@/lib/axios";

const stickerService = {
  getStore: async () => {
    try {
      const response = await api.get("/stickers/store");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Lỗi tải danh sách cửa hàng sticker" };
    }
  },

  getMyStickers: async () => {
    try {
      const response = await api.get("/stickers/my-stickers");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Lỗi tải nhãn dán của bạn" };
    }
  },

  installPack: async (packId) => {
    try {
      const response = await api.post(`/stickers/install/${packId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Lỗi thêm bộ sticker" };
    }
  },

  uninstallPack: async (packId) => {
    try {
      const response = await api.delete(`/stickers/uninstall/${packId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Lỗi gỡ bỏ bộ sticker" };
    }
  },
};

export default stickerService;
