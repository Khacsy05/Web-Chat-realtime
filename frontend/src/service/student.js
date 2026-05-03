import api from "@/lib/axios";


const student = {
    getAllStudent: async () =>  {
        try {
            const response = await api.get("/students");
            return response
        } catch (error) {
            throw error.response || { message: "Lỗi tải thông tin cá nhân" };
        }
    },
    createStudent: async (data) => {
        try {
            const response = await api.post("/students",data);
            return response
        } catch (error) {
            throw error.response || { message: "Lỗi them thông tin cá nhân" };
        }
    },

    updateStudent: async (studentID, studentData) => {
        try {
            const response = await api.put(`/students/${studentID}`,studentData);
            return response;
        } catch (error) {
              throw error.response || { message: "Lỗi sua thông tin cá nhân" };
        }
    },
    deleteStudent:async (studentID) => {
        try {
            const response = await api.delete(`/students/${studentID}`);
            return response;
        } catch (error) {
              throw error.response || { message: "Lỗi xoa thông tin cá nhân" };
        }
    },
}

export default student