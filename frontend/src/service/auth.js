import api from "@/lib/axios";


const auth = {
    login: async (data) => {
        try {
            const response = await api.post("/auth/login",data);
            return response
        } catch (error) {
            throw error.response || { message: "Lỗi dang nhap" };
        }
    },

    sendOtp: async (data) => {
        try {
            const response = await api.post("/auth/send-otp",data)
            return response
        } catch (error) {
            throw error.response || { message: "Lỗi gui otp" };
        }
    },

    verifyOtp: async (data) => {
        try {
            const response = await api.post("/auth/verify-otp",data)
            return response
        } catch (error) {
            throw error.response || { message: "Lỗi xac thuc otp" };
        }
    },

    ResetPass: async (data) => {
        try {
            const response = await api.put("/auth/resetPassword",data)
            return response
        } catch (error) {
            throw error.response || { message: "Lỗi doi mat khau" };
        }
    }
}
export default auth

