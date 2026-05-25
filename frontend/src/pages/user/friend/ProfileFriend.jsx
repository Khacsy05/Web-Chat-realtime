import user from '@/service/user';
import React, { useEffect, useState } from 'react'

const ProfileFriend = ({userId}) => {
    const [profile, setProfile] = useState(null);
    const fetchProfile = async () => {
        try {
        const response = await user.getProfileUser(userId);
        setProfile(response.data.profile);
        } catch (error) {
        console.error(error);
        }
    };
    useEffect(() => {
        fetchProfile();
      }, []);

    const displayName = profile?.fullname || "Nguoi dung";
    const avatarSrc = `http://localhost:5000${profile?.avatar || "/uploads/default-avatar.png"}`;

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white text-4xl font-bold shadow-md">
                <img
                src={avatarSrc}
                alt={displayName}
                className="w-24 h-24 rounded-full object-cover"
                />
            </div>

            <div className="text-xl font-semibold text-gray-800">{displayName}</div>

            <div className="w-full mt-2">
                <div className="text-sm font-semibold text-gray-600 mb-2">Thong tin ca nhan</div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                    <InfoRow label="Gioi tinh" value={profile?.gender || "Chua cap nhat"} />
                    <InfoRow
                        label="Ngay sinh"
                        value={
                        profile?.dateOfBirth
                            ? new Date(profile.dateOfBirth).toLocaleDateString("vi-VN")
                            : "Chua cap nhat"
                        }
                    />
                    <InfoRow label="Dia chi" value={profile?.address || "Chua cap nhat"} />
                </div>
            </div>
        </div>
    );
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-500">{label}</span>
    <span className="text-gray-800 font-medium text-right max-w-[60%]">{value}</span>
  </div>
);

export default ProfileFriend
