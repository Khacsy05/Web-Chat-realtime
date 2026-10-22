import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  Sparkles,
  Plus,
  Check,
  Trash2,
  Store,
  ArrowLeft,
  Smile,
  Flame,
} from "lucide-react";
import useStickerStore from "@/stores/useStickerStore";

const StickerStoreModal = ({ isOpen, onClose }) => {
  const {
    storePacks,
    myPacks,
    fetchStorePacks,
    installPack,
    uninstallPack,
    isLoadingStore,
  } = useStickerStore();

  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'installed'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPackPreview, setSelectedPackPreview] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchStorePacks();
    }
  }, [isOpen, fetchStorePacks]);

  if (!isOpen) return null;

  // Lọc danh sách pack theo từ khóa tìm kiếm
  const isInstalled = (pack) => {
    const packId = pack.packId || pack._id || pack.id;
    return myPacks.some(
      (p) => (p.packId === packId || p._id === packId || p.id === packId)
    );
  };

  const currentList = activeTab === "installed"
    ? myPacks
    : storePacks.length > 0
    ? storePacks
    : myPacks;

  const filteredPacks = currentList.filter((pack) => {
    const q = searchQuery.toLowerCase();
    return (
      pack.name?.toLowerCase().includes(q) ||
      pack.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col h-[620px] max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/30">
          <div className="flex items-center gap-3">
            {selectedPackPreview ? (
              <button
                type="button"
                onClick={() => setSelectedPackPreview(null)}
                className="p-1.5 -ml-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition cursor-pointer"
                title="Quay lại danh sách"
              >
                <ArrowLeft size={20} />
              </button>
            ) : (
              <div className="size-10 rounded-2xl bg-blue-600/10 text-[#0068ff] flex items-center justify-center shadow-inner">
                <Store size={22} className="stroke-[2.2]" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                {selectedPackPreview ? selectedPackPreview.name : "Cửa hàng Nhãn dán"}
                {!selectedPackPreview && (
                  <span className="text-[11px] font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Sparkles size={11} /> Miễn phí
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-500">
                {selectedPackPreview
                  ? `${selectedPackPreview.stickers?.length || 0} nhãn dán trong bộ sưu tập này`
                  : "Khám phá và thêm các bộ nhãn dán vui nhộn vào cuộc trò chuyện"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* CHI TIẾT XEM THỬ 1 PACK */}
        {selectedPackPreview ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Pack overview banner */}
            <div className="p-5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={selectedPackPreview.icon}
                  alt={selectedPackPreview.name}
                  className="size-16 object-contain rounded-2xl bg-white p-2 shadow-sm border border-gray-200/60"
                />
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    {selectedPackPreview.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 max-w-sm line-clamp-2">
                    {selectedPackPreview.description || "Bộ nhãn dán độc quyền sắc nét"}
                  </p>
                  <span className="inline-block mt-1 text-[11px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md">
                    {selectedPackPreview.stickers?.length || 0} stickers
                  </span>
                </div>
              </div>

              <div>
                {isInstalled(selectedPackPreview) ? (
                  <button
                    type="button"
                    onClick={() => uninstallPack(selectedPackPreview)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition active:scale-95 cursor-pointer shadow-sm"
                  >
                    <Trash2 size={15} /> Gỡ bỏ
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => installPack(selectedPackPreview)}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#0068ff] text-white hover:bg-[#0052cc] transition shadow-md shadow-blue-500/25 active:scale-95 cursor-pointer"
                  >
                    <Plus size={16} /> Thêm nhãn dán
                  </button>
                )}
              </div>
            </div>

            {/* Grid tất cả sticker trong pack */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {selectedPackPreview.stickers?.map((stk) => (
                  <div
                    key={stk.id || stk.url}
                    className="group relative flex flex-col items-center justify-center p-3 rounded-2xl bg-gray-50 hover:bg-blue-50/60 border border-transparent hover:border-blue-100 transition duration-150 aspect-square"
                  >
                    <img
                      src={stk.url}
                      alt={stk.name}
                      loading="lazy"
                      className="size-16 object-contain group-hover:scale-110 transition-transform duration-200 pointer-events-none"
                    />
                    {stk.name && (
                      <span className="text-[10px] text-gray-400 group-hover:text-blue-600 truncate mt-1 w-full text-center">
                        {stk.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* DANH SÁCH PACKS CỬA HÀNG */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* TABS & SEARCH */}
            <div className="px-6 py-3 border-b border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white">
              {/* Tabs */}
              <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTab === "all"
                      ? "bg-white text-[#0068ff] shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Tất cả ({storePacks.length || myPacks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("installed")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTab === "installed"
                      ? "bg-white text-[#0068ff] shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Đã thêm ({myPacks.length})
                </button>
              </div>

              {/* Search bar */}
              <div className="relative flex-1 sm:max-w-xs">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm bộ nhãn dán..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-100/80 hover:bg-gray-100 focus:bg-white rounded-xl border border-transparent focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* PACKS LIST */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {filteredPacks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
                  <Smile size={48} className="stroke-[1.2] text-gray-300 mb-2" />
                  <p className="text-sm font-medium text-gray-600">
                    Không tìm thấy bộ nhãn dán nào
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Thử tìm kiếm với từ khóa khác xem sao nhé!
                  </p>
                </div>
              ) : (
                filteredPacks.map((pack) => {
                  const installed = isInstalled(pack);
                  const previewList = pack.stickers?.slice(0, 4) || [];

                  return (
                    <div
                      key={pack.packId || pack._id || pack.id}
                      className="group relative bg-white border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 rounded-2xl p-4 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      {/* Left: Icon & Info */}
                      <div
                        className="flex items-center gap-3.5 cursor-pointer flex-1 min-w-0"
                        onClick={() => setSelectedPackPreview(pack)}
                      >
                        <img
                          src={pack.icon}
                          alt={pack.name}
                          className="size-14 object-contain rounded-2xl bg-gray-50 p-1.5 border border-gray-100 group-hover:scale-105 transition-transform shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-800 text-sm group-hover:text-[#0068ff] transition-colors truncate">
                              {pack.name}
                            </h4>
                            {pack.isDefault && (
                              <span className="text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60 px-1.5 py-0.2 rounded-md shrink-0">
                                Phổ biến
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                            {pack.description || "Bộ nhãn dán sinh động"}
                          </p>
                          <span className="text-[11px] text-gray-400 font-medium mt-1 inline-block">
                            {pack.stickers?.length || 0} nhãn dán
                          </span>
                        </div>
                      </div>

                      {/* Middle: 4 Thumbnail preview */}
                      <div
                        className="flex items-center gap-1.5 bg-gray-50/70 p-1.5 rounded-xl border border-gray-100/60 cursor-pointer self-center sm:self-auto"
                        onClick={() => setSelectedPackPreview(pack)}
                        title="Bấm để xem tất cả nhãn dán"
                      >
                        {previewList.map((stk) => (
                          <img
                            key={stk.id || stk.url}
                            src={stk.url}
                            alt=""
                            className="size-9 object-contain hover:scale-110 transition-transform pointer-events-none"
                          />
                        ))}
                      </div>

                      {/* Right: Action button */}
                      <div className="shrink-0 self-end sm:self-center">
                        {installed ? (
                          <div className="flex items-center gap-2">
                            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-100">
                              <Check size={14} className="stroke-[2.5]" /> Đã có
                            </span>
                            <button
                              type="button"
                              onClick={() => uninstallPack(pack)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition active:scale-95 cursor-pointer"
                              title="Gỡ bộ nhãn dán này"
                            >
                              <Trash2 size={14} /> Gỡ
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => installPack(pack)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#0068ff] text-white hover:bg-[#0052cc] transition shadow-sm shadow-blue-500/20 active:scale-95 cursor-pointer"
                          >
                            <Plus size={15} /> Thêm
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
          <span>
            {myPacks.length} bộ nhãn dán đã được kích hoạt trong thanh trò chuyện
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-medium transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default StickerStoreModal;
