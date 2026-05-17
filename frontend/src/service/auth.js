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
            const response = await api.post("/auth/sendOtp",data)
            return response
        } catch (error) {
            throw error.response || { message: "Lỗi gui otp" };
        }
    },

    verifyOtp: async (data) => {
        try {
            const response = await api.post("/auth/verifyOtp",data)
            return response
        } catch (error) {
            throw error.response || { message: "Lỗi xac thuc otp" };
        }
    },

    ResetPass: async (data) => {
        try {
            const response = await api.put("/auth/resetPass",data)
            return response
        } catch (error) {
            throw error.response || { message: "Lỗi doi mat khau" };
        }
    },
    getProfile: async (data) => {
        try {
            const response = await api.get("/auth/getProfile");
            return response
        } catch (error) {
            throw error.response || { message: "Lỗi doi mat khau" };
        }
    },
    updateProfile: async (data) => {
        try {
            const response = await api.put("/auth/updateProfile",data)
            return response
        } catch (error) {
            throw error.response || { message: "Lỗi cap nhap thong tin" };
        }
    }
}
export default auth

