FROM node:22-alpine

# Tạo và chọn thư mục làm việc bên trong container
WORKDIR /app

# Copy các file quản lý thư viện vào trước
COPY package*.json ./

# Cài đặt các thư viện (dependencies)
RUN npm install

# Copy toàn bộ code còn lại của backend vào container
COPY . .

# Mở port mà server Node.js của bạn đang chạy (ví dụ: 5000)
EXPOSE 5000

# Lệnh để khởi chạy server ở chế độ phát triển
CMD ["node", "server.js"]