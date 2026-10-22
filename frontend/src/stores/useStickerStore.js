import { create } from "zustand";
import stickerService from "@/service/sticker";
import { STICKER_PACKS } from "@/constants/stickers";
import { toast } from "sonner";

export const useStickerStore = create((set, get) => ({
  myPacks: STICKER_PACKS, // Mặc định hiển thị dữ liệu tĩnh ngay lập tức, không đợi API
  storePacks: [],
  isLoadingMyStickers: false,
  isLoadingStore: false,
  isStoreOpen: false,
  previewPack: null,

  setStoreOpen: (isOpen) => set({ isStoreOpen: isOpen }),
  setPreviewPack: (pack) => set({ previewPack: pack }),

  // Lấy các bộ sticker người dùng đã cài
  fetchMyStickers: async () => {
    set({ isLoadingMyStickers: true });
    try {
      const data = await stickerService.getMyStickers();
      if (Array.isArray(data) && data.length > 0) {
        // Chuẩn hóa định dạng id
        const formatted = data.map((p) => ({
          ...p,
          id: p.packId || p._id || p.id,
        }));
        set({ myPacks: formatted });
      }
    } catch (error) {
      console.warn("Không thể tải my-stickers từ backend, dùng mặc định:", error);
    } finally {
      set({ isLoadingMyStickers: false });
    }
  },

  // Lấy toàn bộ danh sách bộ sticker trong cửa hàng
  fetchStorePacks: async () => {
    set({ isLoadingStore: true });
    try {
      const data = await stickerService.getStore();
      if (Array.isArray(data)) {
        const formatted = data.map((p) => ({
          ...p,
          id: p.packId || p._id || p.id,
        }));
        set({ storePacks: formatted });
      }
    } catch (error) {
      console.error("Lỗi tải store stickers:", error);
      toast.error("Không thể tải danh sách cửa hàng nhãn dán");
    } finally {
      set({ isLoadingStore: false });
    }
  },

  // Cài đặt / Thêm bộ sticker
  installPack: async (pack) => {
    const targetId = pack.packId || pack._id || pack.id;
    try {
      await stickerService.installPack(targetId);
      toast.success(`Đã thêm bộ "${pack.name}"!`);

      // Cập nhật trạng thái tức thì trong storePacks và myPacks
      set((state) => {
        const updatedStore = state.storePacks.map((p) =>
          (p.packId === targetId || p._id === targetId || p.id === targetId)
            ? { ...p, isInstalled: true }
            : p
        );

        const existsInMy = state.myPacks.some(
          (p) => p.packId === targetId || p._id === targetId || p.id === targetId
        );

        const newMyPacks = existsInMy
          ? state.myPacks
          : [...state.myPacks, { ...pack, id: targetId }];

        return {
          storePacks: updatedStore,
          myPacks: newMyPacks,
        };
      });
    } catch (error) {
      toast.error(error.message || "Lỗi khi thêm bộ nhãn dán");
    }
  },

  // Gỡ bỏ bộ sticker
  uninstallPack: async (pack) => {
    const targetId = pack.packId || pack._id || pack.id;
    try {
      await stickerService.uninstallPack(targetId);
      toast.info(`Đã gỡ bỏ bộ "${pack.name}"`);

      set((state) => {
        const updatedStore = state.storePacks.map((p) =>
          (p.packId === targetId || p._id === targetId || p.id === targetId)
            ? { ...p, isInstalled: false }
            : p
        );

        const newMyPacks = state.myPacks.filter(
          (p) => p.packId !== targetId && p._id !== targetId && p.id !== targetId
        );

        return {
          storePacks: updatedStore,
          myPacks: newMyPacks,
        };
      });
    } catch (error) {
      toast.error(error.message || "Lỗi khi gỡ bỏ bộ nhãn dán");
    }
  },

  // Tìm pack chứa url sticker bất kỳ
  findPackByStickerUrl: (url) => {
    if (!url) return null;
    const cleanUrl = url.split("?")[0];
    const { myPacks, storePacks } = get();
    const allPacks = [...myPacks, ...storePacks, ...STICKER_PACKS];

    return allPacks.find((pack) =>
      pack.stickers?.some(
        (s) =>
          s.url === cleanUrl ||
          cleanUrl.endsWith(s.url) ||
          s.url.endsWith(cleanUrl) ||
          cleanUrl.includes(s.url)
      )
    );
  },
}));

export default useStickerStore;
