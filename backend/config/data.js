import mongoose from "mongoose";

mongoose.connection.on("error", (err) => {
    console.warn("⚠️ Cảnh báo kết nối MongoDB:", err?.message || err);
});

mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ Mất kết nối MongoDB tạm thời, đang tự động kết nối lại...");
});

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("Lien ket CSDL thanh cong");
    } catch (error) {
        console.error("Loi khi ket noi CSDL:", error);
    }
};