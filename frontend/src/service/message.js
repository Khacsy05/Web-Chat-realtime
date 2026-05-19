import api from "@/lib/axios";

const message = {
    getConversation: async() => {
        try {
            const response = await api.get("/conversation/getUserConversations");
            return response
        } catch (error) {
            throw error.response || { message: "Lỗi get conversation" };
        }
    },
    getMessage: async(conversationId) => {
        try {
            const response  = await api.get(`/message/getMessage/${conversationId}`);
            return response
        } catch (error) {
             throw error.response || { message: "Lỗi get message" };
        }
    },
    sendMessage: async(data) => {
        try {
            const response = await api.post("/message/sendMessage",data);
            return response;
        } catch (error) {
            throw error.response || { message: "Loi gui tin nhan" };
        }
    },
    createOrGetConversation: async (receiverId) => {
        try {
            const response = await api.post("/conversation/createOrGetConversation", {
                receiverId,
            });
            return response;
        } catch (error) {
            throw error.response || { message: "Loi tao hoac lay cuoc tro chuyen" };
        }
    }

}

export default message
