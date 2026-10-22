import React, { useState, useEffect } from "react";
import { STICKER_PACKS } from "@/constants/stickers";
import useStickerStore from "@/stores/useStickerStore";
import StickerStoreModal from "./StickerStoreModal";
import { X, Sparkles, Store, Plus } from "lucide-react";

const StickerPicker = ({ isOpen, onClose, onSelectSticker, initialPackId }) => {
  const { myPacks, fetchMyStickers, isStoreOpen, setStoreOpen } = useStickerStore();

  const packsList = myPacks && myPacks.length > 0 ? myPacks : STICKER_PACKS;

  const [activePackId, setActivePackId] = useState(
    initialPackId || packsList[0]?.packId || packsList[0]?.id || "cuppy"
  );

  useEffect(() => {
    if (isOpen) {
      fetchMyStickers();
    }
  }, [isOpen, fetchMyStickers]);

  useEffect(() => {
    if (initialPackId) {
      setActivePackId(initialPackId);
    }
  }, [initialPackId]);

  // Đảm bảo activePackId luôn hợp lệ khi danh sách myPacks thay đổi
  useEffect(() => {
    const exists = packsList.some(
      (p) => (p.packId || p._id || p.id) === activePackId
    );
    if (!exists && packsList.length > 0) {
      setActivePackId(packsList[0].packId || packsList[0]._id || packsList[0].id);
    }
  }, [packsList, activePackId]);

  if (!isOpen && !isStoreOpen) return null;

  const currentPack =
    packsList.find(
      (p) => (p.packId || p._id || p.id) === activePackId
    ) || packsList[0];

  return (
    <>
      {isOpen && (
        <div className="absolute bottom-full left-3 mb-2 w-80 sm:w-96 rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-md shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150 flex flex-col h-[380px]">
          {/* HEADER */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
              <Sparkles size={14} className="text-[#0068ff]" />
              <span className="truncate max-w-[180px]">{currentPack?.name}</span>
              <span className="text-[10px] font-normal text-gray-400 bg-gray-100 px-1.5 py-0.2 rounded">
                {currentPack?.stickers?.length || 0}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setStoreOpen(true)}
                title="Khám phá Cửa hàng nhãn dán"
                className="flex items-center gap-1 text-[11px] font-medium text-[#0068ff] hover:bg-blue-50 px-2 py-1 rounded-lg transition cursor-pointer"
              >
                <Store size={13} />
                <span>Cửa hàng</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* GRID STICKERS */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-4 gap-2.5">
              {currentPack?.stickers?.map((stk) => (
                <button
                  key={stk.id || stk.url}
                  type="button"
                  onClick={() => onSelectSticker(stk.url)}
                  title={stk.name}
                  className="group relative flex items-center justify-center p-2 rounded-xl hover:bg-blue-50/70 active:scale-90 transition-all cursor-pointer aspect-square"
                >
                  <img
                    src={stk.url}
                    alt={stk.name || "sticker"}
                    loading="lazy"
                    className="size-16 object-contain pointer-events-none group-hover:scale-110 transition-transform"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* FOOTER TAB BAR (Các bộ sticker đã cài + Nút Thêm vào Store) */}
          <div className="flex items-center gap-1 px-2 py-1.5 border-t border-gray-100 bg-[#f8f9fa] shrink-0 overflow-x-auto">
            {packsList.map((pack) => {
              const packKey = pack.packId || pack._id || pack.id;
              const isActive = packKey === activePackId;
              return (
                <button
                  key={packKey}
                  type="button"
                  onClick={() => setActivePackId(packKey)}
                  title={pack.name}
                  className={`flex items-center justify-center size-9 rounded-lg transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-white shadow-sm border border-gray-200 scale-105"
                      : "hover:bg-gray-200/70 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={pack.icon}
                    alt={pack.name}
                    className="size-6 object-contain pointer-events-none"
                  />
                </button>
              );
            })}

            {/* Nút dấu + dẫn vào Cửa hàng nhãn dán */}
            <button
              type="button"
              onClick={() => setStoreOpen(true)}
              title="Thêm nhãn dán mới từ Cửa hàng"
              className="flex items-center justify-center size-9 rounded-lg border border-dashed border-gray-300 hover:border-[#0068ff] hover:bg-blue-50 text-gray-400 hover:text-[#0068ff] transition-all cursor-pointer shrink-0 ml-1"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      )}

      {/* CỬA HÀNG NHÃN DÁN (MODAL) */}
      <StickerStoreModal
        isOpen={isStoreOpen}
        onClose={() => setStoreOpen(false)}
      />
    </>
  );
};

export default StickerPicker;
