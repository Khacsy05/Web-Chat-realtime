import multer from "multer";

// Sử dụng memoryStorage để lưu trữ file dạng Buffer trong RAM
// giúp stream trực tiếp lên Cloudinary mà không tốn dung lượng ổ đĩa máy chủ
const storage = multer.memoryStorage();

export const uploads = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Giới hạn kích thước file 10MB
  },
});