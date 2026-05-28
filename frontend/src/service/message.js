import api from "@/lib/axios";

const message = {
    getConversation: async (params) => {
        const res = await api.get("/conversation/getUserConversations", {
            params: {
                limit: params?.limit || 20,
                after: params?.after || null,
            }
        });
        return res;
    },
    getMessage: async(conversationId,params) => {
        try {
            const response  = await api.get(`/message/getMessage/${conversationId}`,{
                params: {
                    limit: params?.limit || 20,
                    before: params?.before || null,
                }
            });
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


}

export default message
