import { createPortal } from "react-dom";

const ImageViewer = ({ src, onClose }) => {
  if (!src) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] cursor-zoom-out select-none"
      onClick={onClose}
    >
      {/* Khung chứa ảnh: Tối đa chiếm 85% chiều rộng và 85% chiều cao màn hình */}
      <div className="max-w-[85vw] max-h-[85vh] flex items-center justify-center">
        <img
          src={src}
          alt="Full size"
          // SỬA TẠI ĐÂY: Dùng max-w-full, max-h-full và object-contain để ảnh tự cân đối, không bị cắt rìa
          className="max-w-full max-h-full object-contain rounded-sm shadow-2xl cursor-default"
          onClick={(e) => e.stopPropagation()} // Ngăn việc click vào ảnh bị đóng modal
        />
      </div>
    </div>,
    document.body
  );
};

export default ImageViewer;