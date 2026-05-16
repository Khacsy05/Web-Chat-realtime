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
    }

}

export default message
