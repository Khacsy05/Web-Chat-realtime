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
    }
}

export default user;
