import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { renderAsync } from 'docx-preview';
import { FileText, Download, ExternalLink, X, Loader2, AlertCircle } from 'lucide-react';
import { downloadFile, getPreviewUrl } from '@/lib/utils';

/**
 * FileViewerModal - Trình xem trước file phong cách Zalo
 * - DOCX: Render trực tiếp nội dung Word bằng thư viện docx-preview nội bộ mà không phụ thuộc Google Docs!
 * - PDF / Ảnh / Video: Hiển thị trực tiếp trên trình duyệt
 * - Các định dạng khác: Dự phòng hiển thị Google Docs Viewer / Office Viewer
 */
const FileViewerModal = ({ file, onClose }) => {
  const docxContainerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (!file) return null;

  const fileName = file.name || "Tập tin";
  const fileUrl = file.url;
  const lowerName = fileName.toLowerCase();
  const isDocx = lowerName.endsWith('.docx');
  const isPdf = lowerName.endsWith('.pdf');
  const isImage = lowerName.match(/\.(png|jpg|jpeg|gif|webp|svg)$/);
  const isVideo = lowerName.match(/\.(mp4|webm|ogg)$/);

  useEffect(() => {
    let isCancelled = false;

    if (isDocx && docxContainerRef.current) {
      setLoading(true);
      setError(null);

      fetch(fileUrl)
        .then((res) => {
          if (!res.ok) throw new Error("Không thể tải file Word");
          return res.blob();
        })
        .then(async (blob) => {
          if (isCancelled || !docxContainerRef.current) return;
          docxContainerRef.current.innerHTML = "";
          await renderAsync(blob, docxContainerRef.current, null, {
            className: "docx-viewer-content",
            inWrapper: true,
            ignoreWidth: false,
            ignoreHeight: false,
            breakPages: true,
          });
          setLoading(false);
        })
        .catch((err) => {
          console.error("Lỗi xem file docx:", err);
          if (!isCancelled) {
            setError("Không thể đọc định dạng tài liệu này trực tiếp.");
            setLoading(false);
          }
        });
    } else {
      setLoading(false);
    }

    return () => {
      isCancelled = true;
    };
  }, [fileUrl, isDocx]);

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex flex-col bg-black/85 backdrop-blur-md animate-fade-in select-none">
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-5 bg-[#1e1e1e] text-white border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-9 items-center justify-center rounded-lg bg-blue-600/30 text-blue-400 shrink-0">
            <FileText size={20} />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate max-w-[280px] sm:max-w-[480px]" title={fileName}>
              {fileName}
            </div>
            <div className="text-[11px] text-gray-400">
              {isDocx ? "Xem trước tài liệu Word (Zalo Preview)" : "Xem trước trực tiếp"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => downloadFile(fileUrl, fileName)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-medium text-white transition shadow-sm cursor-pointer"
            title="Tải file về máy"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Tải về máy</span>
          </button>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-300 transition cursor-pointer"
            title="Mở tab mới"
          >
            <ExternalLink size={14} />
            <span className="hidden sm:inline">Tab mới</span>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition cursor-pointer ml-1"
            title="Đóng (ESC)"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Body Viewer */}
      <div className="flex-1 w-full h-[calc(100vh-3.5rem)] bg-[#181818] overflow-auto flex items-center justify-center p-2 sm:p-5">
        {loading && (
          <div className="flex flex-col items-center gap-3 text-white">
            <Loader2 size={36} className="animate-spin text-blue-500" />
            <span className="text-sm text-gray-300">Đang nạp dữ liệu xem trước...</span>
          </div>
        )}

        {isDocx ? (
          <div
            ref={docxContainerRef}
            className={`w-full max-w-4xl max-h-full overflow-y-auto bg-white rounded-lg shadow-2xl p-4 sm:p-8 select-text ${
              loading ? "hidden" : "block"
            }`}
            style={{ minHeight: "60vh" }}
          />
        ) : isPdf ? (
          <iframe
            src={fileUrl}
            title={fileName}
            className="w-full h-full max-w-5xl rounded-lg border border-gray-800 bg-white shadow-2xl"
          />
        ) : isImage ? (
          <img
            src={fileUrl}
            alt={fileName}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        ) : isVideo ? (
          <video
            src={fileUrl}
            controls
            autoPlay
            className="max-w-full max-h-full rounded-lg shadow-2xl"
          />
        ) : (
          <iframe
            src={getPreviewUrl(fileUrl, fileName)}
            title={fileName}
            className="w-full h-full max-w-5xl rounded-lg border border-gray-800 bg-white shadow-2xl"
            allow="autoplay"
          />
        )}

        {error && (
          <div className="flex flex-col items-center gap-3 p-6 bg-gray-900 border border-gray-800 rounded-xl max-w-md text-center text-white">
            <AlertCircle size={40} className="text-amber-500" />
            <div className="font-medium text-sm">{error}</div>
            <button
              onClick={() => downloadFile(fileUrl, fileName)}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-semibold rounded-lg text-white"
            >
              Tải tập tin về máy để mở
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default FileViewerModal;
