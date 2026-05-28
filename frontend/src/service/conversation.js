import api from "@/lib/axios";
const conversation = {
    createOrGetConversation: async (receiverId) => {
        try {
            const response = await api.post("/conversation/createOrGetConversation", {
                receiverId,
            });
            return response;
        } catch (error) {
            throw error.response || { message: "Loi tao hoac lay cuoc tro chuyen" };
        }
    },
    deleteConversation: async (conversationId) => {
        try {
            const response = await api.post("/conversation/deleteConversation", {
                conversationId,
            });
            return response;
        } catch (error) {
            throw error.response || { message: "Loi tao hoac lay cuoc tro chuyen" };
        }
    },
}

export default conversation