import React, { useEffect, useState } from "react";
import EditProfile from "./EditProfile";
import ViewProfile from "./ViewProfile";
import auth from "@/service/auth";
import useAuthStore from "@/stores/useAuthStore";
import user from "@/service/user";


const Profile = () => {
  const [mode, setMode] = useState("view"); // view | edit
  const [profile, setProfile] = useState(null);
  const updateUser = useAuthStore((state) => state.updateUser);
  const fetchProfile = async () => {
    try {
      const response = await auth.getProfile();
      setProfile(response.data.profile);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);

    const res = await user.updateAvatar(formData);

    const updatedProfile = res.data.profile || res.data;
    setProfile(updatedProfile);
    updateUser({ avatar: updatedProfile.avatar });
  };
  
  const handleUpdate = async (data) => {
    const res = await auth.updateProfile(data);

    // update lại UI ngay lập tức
    setProfile(res.data);
    setMode("view")
  };
  useEffect(() => {
    fetchProfile();
  }, []);

  if (!profile ) {
    return <div className="text-center text-gray-500">Đang tải hồ sơ...</div>;
  }

  
  return (
    <div className="relative w-full overflow-hidden">
      {/* Slider */}
      <div
        className={`flex w-[200%] transition-transform duration-300 ease-in-out
          ${mode === "edit" ? "-translate-x-1/2" : "translate-x-0"}
        `}
      >
        {/* Trang xem thông tin */}
        <div className="w-1/2 p-4">
          <ViewProfile 
            onEdit={() => setMode("edit")} 
            profile={profile}
            onAvatarChange={handleUpload}
          />
        </div>

        {/* Trang chỉnh sửa */}
        <div className="w-1/2 p-4">
          <EditProfile 
            onBack={() => setMode("view")} 
            onSave={handleUpdate}
            profile={profile}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
