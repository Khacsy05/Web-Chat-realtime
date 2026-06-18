FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Mở port mặc định của React (Vite thường là 5173, Create-React-App là 3000)
EXPOSE 5137

CMD ["npm", "run", "dev"]