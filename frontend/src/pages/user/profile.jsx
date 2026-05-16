import auth from "@/service/auth";
import React, { useEffect, useState } from "react";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [authInfo, setAuthInfo] = useState(null);

  const fetchProfile = async () => {
    try {
      const response = await auth.getProfile();
      setProfile(response.data.profile);
      setAuthInfo(response.data.auth);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (!profile || !authInfo) {
    return <div className="text-center text-gray-500">Đang tải hồ sơ...</div>;
  }

  const displayName =
    profile.fullname || authInfo.username || "Người dùng";

  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar */}
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white text-4xl font-bold shadow-md">
        {avatarLetter}
      </div>

      {/* Tên */}
      <div className="text-xl font-semibold text-gray-800">
        {displayName}
      </div>

      {/* Card thông tin */}
      <div className="w-full mt-2 bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
        <InfoRow label="Email" value={authInfo.email} />
        <InfoRow label="Tên đăng nhập" value={authInfo.username} />
        <InfoRow label="Ngày sinh" value={profile.dateOfBirth || "Chưa cập nhật"} />
        <InfoRow label="Địa chỉ" value={profile.address || "Chưa cập nhật"} />
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-500">{label}</span>
    <span className="text-gray-800 font-medium text-right max-w-[60%]">
      {value}
    </span>
  </div>
);

export default Profile;