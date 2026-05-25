import api from "@/lib/axios";


const user = {
    updateAvatar: async (formData) => {
        try {
            const response = await api.put("/user/updateAvatar", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response;
        } catch (error) {
            throw error.response || { message: "Loi cap nhat avatar" };
        }
    },
    getAllFriend : async(params) => {
        try {
            const response = await api.get("/user/getAllFriend", {
                params: {
                    limit: params?.limit || 20,
                    after: params?.after || null,
                },
            });
            return response
        } catch (error) {
             throw error.response || { message: "Lỗi get conversation" };
        }
    },
    getAllUser : async()=> {
        try {
            const response = await api.get("/user/getAllUser");
            return response
        } catch (error) {
            throw error.response || { message: "Lỗi get user" };
        }
    },
    friendRequest : async(idFriend)=> {
        try {
            const response = await api.post("/user/friendRequest",{
                to: idFriend
            });
            return response
        } catch (error) {
            throw error.response || { message: "Lỗi post request" };
        }
    },
    cancelRequest : async(idRequest)=> {
        try {
            const response = await api.post("/user/cancelRequest", { requestId: idRequest });
            return response
        } catch (error) {
            throw error.response || { message: "Lỗi post request" };
        }
    },
    receivedRequest: async() => {
        try {
            const response = await api.get("/user/getReceivedRequest");
            return response
        } catch (error) {
            throw error.response || { message: "Lỗi getReceivedRequest" };
        }
    },
    sentRequest: async() => {
        try {
            const response = await api.get("/user/getSentRequest");
            return response
        } catch (error) {
            throw error.response || { message: "Lỗi getSentRequest" };
        }
    },
    acceptRequest: async(idRequest) => {
        try {
            const response = await api.post("/user/acceptRequest",{ requestId: idRequest });
            return response
        } catch (error) {
            throw error.response || { message: "Lỗi acceptRequest" };
        }
    },
    rejectRequest: async(idRequest) => {
        try {
            const response = await api.post("/user/rejectRequest",{ requestId: idRequest });
            return response
        } catch (error) {
            throw error.response || { message: "Lỗi acceptRequest" };
        }
    },
    unFriend:async(friendId) => {
        try {
            const response = await api.post("/user/unFriend",{ friendId: friendId });
            return response
        } catch (error) {
            throw error.response || { message: "Lỗi acceptRequest" };
        }
    },
    getProfileUser:async(UserId) => {
        try {
            const response = await api.post("/user/getProfileUser",{ userId: UserId });
            return response
        } catch (error) {
            throw error.response || { message: "Lỗi acceptRequest" };
        }
    },
}


export default user;
