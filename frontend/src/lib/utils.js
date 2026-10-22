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
