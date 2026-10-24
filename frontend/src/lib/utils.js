import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/**
 * Chuẩn hóa URL hình ảnh:
 * - Nếu là ảnh từ Cloudinary hoặc link web (bắt đầu bằng http:// hoặc https://) -> trả về nguyên vẹn
 * - Nếu là đường dẫn tương đối (ví dụ /uploads/...) -> ghép với API_BASE_URL
 * - Nếu rỗng/null -> dùng defaultPath
 */
export function getImageUrl(path, defaultPath = "/uploads/default-avatar.png") {
  if (!path) {
    if (!defaultPath) return "";
    return defaultPath.startsWith("http://") || defaultPath.startsWith("https://")
      ? defaultPath
      : `${API_BASE_URL}${defaultPath.startsWith("/") ? "" : "/"}${defaultPath}`;
  }
  if (
    typeof path === "string" &&
    (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/stickers/"))
  ) {
    return path;
  }
  return `${API_BASE_URL}${typeof path === "string" && path.startsWith("/") ? "" : "/"}${path}`;
}

export function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileUrl(path, fileName) {
  if (!path) return "";
  let url = path;
  if (!(typeof path === "string" && (path.startsWith("http://") || path.startsWith("https://")))) {
    url = `${API_BASE_URL}${typeof path === "string" && path.startsWith("/") ? "" : "/"}${path}`;
  }
  return url;
}

/**
 * Chuẩn hóa URL cho thẻ <a>:
 * Nếu người dùng chỉ gõ "facebook.com" hoặc "google.com" thì tự động thêm "https://"
 */
export function formatLinkUrl(url) {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Kiểm tra chuỗi có chứa đường link hay không
 */
export function containsLink(text) {
  if (!text || typeof text !== "string") return false;
  return /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|vn|net|org|edu|io|co|me|info|dev)[^\s]*)/i.test(text);
}

/**
 * Tách và tìm tất cả link trong nội dung tin nhắn
 */
export function extractLinks(text) {
  if (!text || typeof text !== "string") return [];
  const regex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(?:com|vn|net|org|edu|io|co|me|info|dev)(?:\/[^\s]*)?)/gi;
  const matches = text.match(regex);
  return matches || [];
}

/**
 * Kiểm tra file đã được tải về lưu cache hay chưa
 */
export function isFileDownloaded(fileIdOrUrl) {
  if (!fileIdOrUrl) return false;
  try {
    const list = JSON.parse(localStorage.getItem("downloaded_files") || "[]");
    return list.includes(String(fileIdOrUrl));
  } catch {
    return false;
  }
}

/**
 * Đánh dấu file đã được tải về
 */
export function markFileDownloaded(fileIdOrUrl) {
  if (!fileIdOrUrl) return;
  try {
    const list = JSON.parse(localStorage.getItem("downloaded_files") || "[]");
    if (!list.includes(String(fileIdOrUrl))) {
      list.push(String(fileIdOrUrl));
      localStorage.setItem("downloaded_files", JSON.stringify(list));
    }
  } catch (e) {
    console.error(e);
  }
}

/**
 * Lấy URL xem trước tài liệu văn phòng (Word, Excel, PowerPoint, PDF)
 */
export function getPreviewUrl(fileUrl, fileName = "") {
  if (!fileUrl) return "";
  const nameToCheck = (fileName || fileUrl).toLowerCase();
  const lowerUrl = fileUrl.toLowerCase();

  // Nếu là PDF hoặc hình ảnh/video thì xem trực tiếp
  if (
    nameToCheck.endsWith(".pdf") ||
    lowerUrl.includes("/image/") ||
    nameToCheck.endsWith(".png") ||
    nameToCheck.endsWith(".jpg") ||
    nameToCheck.endsWith(".jpeg") ||
    nameToCheck.endsWith(".webp") ||
    nameToCheck.endsWith(".mp4")
  ) {
    return fileUrl;
  }

  // Các định dạng tài liệu văn phòng (docx, doc, xlsx, xls, pptx, ppt) xem qua Google Docs Viewer
  if (
    nameToCheck.endsWith(".doc") ||
    nameToCheck.endsWith(".docx") ||
    nameToCheck.endsWith(".xls") ||
    nameToCheck.endsWith(".xlsx") ||
    nameToCheck.endsWith(".ppt") ||
    nameToCheck.endsWith(".pptx") ||
    nameToCheck.endsWith(".txt")
  ) {
    // Nếu URL chưa có phần mở rộng ở đuôi (ví dụ Cloudinary raw hash cũ), append thêm param để Google Docs nhận diện đúng định dạng
    let targetDocUrl = fileUrl;
    if (fileName && !lowerUrl.split("?")[0].includes(".")) {
      const extMatch = fileName.match(/\.[a-zA-Z0-9]+$/);
      if (extMatch) {
        targetDocUrl = `${fileUrl}?ext=${encodeURIComponent(fileName)}`;
      }
    }
    return `https://docs.google.com/viewer?url=${encodeURIComponent(targetDocUrl)}&embedded=true`;
  }
  return fileUrl;
}

/**
 * Tải file trực tiếp và giữ nguyên tên file gốc cùng đuôi mở rộng (.docx, .pdf, .xlsx...)
 */
export async function downloadFile(url, fileName = "download", fileId = null) {
  if (!url) return;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
    if (fileId) {
      markFileDownloaded(fileId);
    } else {
      markFileDownloaded(url);
    }
  } catch (error) {
    console.error("Lỗi khi tải file:", error);
    // Fallback mở tab mới nếu fetch CORS bị chặn
    window.open(url, "_blank");
    if (fileId) {
      markFileDownloaded(fileId);
    } else {
      markFileDownloaded(url);
    }
  }
}
