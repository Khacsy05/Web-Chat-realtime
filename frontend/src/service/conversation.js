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
    createGroup : async (formData) => {
        try {
            const response = await api.post("/conversation/createGroupConversation", formData , {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            });
            return response;
        } catch (error) {
            throw error.response || { message: "Loi tao nhom" };
        }
    },
    removeMember : async (conversationId,memberId,newAdminId) => {
        try {
            const response = await api.put("/conversation/removeMember",{
                conversationId: conversationId,
                memberId: memberId,
                newAdminId: newAdminId
            })
            return response
        } catch (error) {
            throw error.response || { message: "Loi roi nhom" };
        }
    },
    addMember: async (conversationId,memberIds) => {
        try {
            const response = await api.put("/conversation/addMember",{
                conversationId: conversationId,
                memberIds: memberIds
            })
            return response
        } catch (error) {
            throw error.response || { message: "Loi roi nhom" };
        }
    },
    updateAvatar: async (formData) => {
        try {
            const response = await api.put("/conversation/updateAvatar", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response;
        } catch (error) {
            throw error.response || { message: "Loi cap nhat avatar" };
        }
    },
    updateNameGroup: async (data) => {
        try {
            const response = await api.put("/conversation/updateNameGroup", data);
            return response;
        } catch (error) {
            throw error.response || { message: "Loi cap nhat avatar" };
        }
    },
}

export default conversation