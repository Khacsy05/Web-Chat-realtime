import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"; // Đảm bảo bạn đã cài lucide-react

const ImageViewer = ({ src, onClose }) => {
  if (!src) return null;

  const [scale, setScale] = useState(1);

  // Giới hạn mức độ zoom tối thiểu và tối đa
  const MIN_SCALE = 1;
  const MAX_SCALE = 4;

  const handleZoomIn = (e) => {
    e?.stopPropagation();
    setScale((prev) => Math.min(prev + 0.25, MAX_SCALE));
  };

  const handleZoomOut = (e) => {
    e?.stopPropagation();
    setScale((prev) => Math.max(prev - 0.25, MIN_SCALE));
  };

  const handleResetZoom = (e) => {
    e?.stopPropagation();
    setScale(1);
  };

  // Tính năng: Lăn chuột để phóng to/thu nhỏ
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        // Lăn lên -> Phóng to
        setScale((prev) => Math.min(prev + 0.15, MAX_SCALE));
      } else {
        // Lăn xuống -> Thu nhỏ
        setScale((prev) => Math.max(prev - 0.15, MIN_SCALE));
      }
    };

    // Chỉ lắng nghe sự kiện lăn chuột khi modal đang mở
    const viewerElement = document.getElementById("image-viewer-container");
    if (viewerElement) {
      viewerElement.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (viewerElement) {
        viewerElement.removeEventListener("wheel", handleWheel);
      }
    };
  }, []);

  return createPortal(
    <div
      id="image-viewer-container"
      className="fixed inset-0 bg-black/95 flex items-center justify-center z-[9999] select-none cursor-zoom-out"
      onClick={onClose} // 👈 Click vào vùng đen ngoài cùng -> Đóng modal
    >
      {/* 1. THANH CÔNG CỤ: Nổi lên trên */}
      <div
        className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-gray-900/90 backdrop-blur-md px-5 py-2 rounded-full border border-gray-700/60 z-[10000] cursor-default shadow-xl"
        onClick={(e) => e.stopPropagation()} // Click vào toolbar không bị đóng
      >
        <button
          onClick={handleZoomOut}
          disabled={scale <= MIN_SCALE}
          className="p-1.5 rounded-full text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Thu nhỏ"
        >
          <ZoomOut size={20} />
        </button>

        <span className="text-white text-sm font-semibold min-w-[50px] text-center">
          {Math.round(scale * 100)}%
        </span>

        <button
          onClick={handleZoomIn}
          disabled={scale >= MAX_SCALE}
          className="p-1.5 rounded-full text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Phóng to"
        >
          <ZoomIn size={20} />
        </button>

        {scale > 1 && (
          <button
            onClick={handleResetZoom}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors border-l border-gray-700/50 pl-3"
            title="Đặt lại"
          >
            <RotateCcw size={16} />
          </button>
        )}
      </div>

      {/* 2. KHUNG VÙNG ĐEN BAO QUANH ẢNH */}
      <div
        className="w-full h-full flex items-center justify-center p-4 cursor-zoom-out"
        onClick={onClose} // 👈 SỬA TẠI ĐÂY: Bấm vào vùng đen trống này vẫn thoát được như thường
      >
        <img
          src={src}
          alt="Full size"
          style={{ transform: `scale(${scale})` }}
          // 👈 CHUYỂN STOPPROPAGATION VÀO ĐÂY: Chỉ khi bấm trúng bức ảnh thì mới KHÔNG bị thoát thôi
          className="max-w-[85vw] max-h-[85vh] object-contain rounded-md shadow-2xl transition-transform duration-200 ease-out origin-center cursor-default"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Gợi ý ở dưới đáy */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-400 text-xs font-normal pointer-events-none bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
        Cuộn chuột để phóng to / thu nhỏ nhanh
      </div>
    </div>,
    document.body
  );
};

export default ImageViewer;