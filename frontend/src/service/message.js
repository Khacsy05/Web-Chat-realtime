import api from "@/lib/axios";

const message = {
    getConversation: async (params) => {
        const res = await api.get("/conversation/getUserConversations", {
            params: {
                limit: params?.limit || 20,
                after: params?.after || null,
                q: params?.q || null,
            }
        });
        return res;
    },
    getMessage: async (conversationId, params) => {
        try {
            const response = await api.get(`/message/getMessage/${conversationId}`, {
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
    sendMessage: async (data) => {
        try {
            const response = await api.post("/message/sendMessage", data);
            return response;
        } catch (error) {
            throw error.response || { message: "Loi gui tin nhan" };
        }
    },

    deleteMessageForMe: async (messageId) => {
        try {
            const response = await api.post("/message/deleteMessageForMe", { messageId });
            return response;
        } catch (error) {
            throw error.response || { message: "Loi xoa tin nhan" };
        }
    },

    revokeMessage: async (messageId, conversationId) => {
        try {
            const response = await api.post("/message/revokeMessage", { messageId, conversationId });
            return response;
        } catch (error) {
            throw error.response || { message: "Loi thu hoi tin nhan" };
        }
    },
    sendImage: async (formData) => {
        try {
            const response = await api.post("/message/sendImage", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response;
        } catch (error) {
            throw error.response || { message: "Loi gui anh" };
        }
    },
    getMediaArchive: async (conversationId) => {
        try {
            const response = await api.get(`/message/getMediaArchive/${conversationId}`);
            return response;
        } catch (error) {
            throw error.response || { message: "Lỗi lấy kho lưu trữ" };
        }
    },

}
export default message
