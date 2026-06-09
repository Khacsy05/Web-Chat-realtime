import React from 'react';

const ProfileFriend = ({ initialData }) => {
    // Vì backend đã populate hết, initialData đã có sẵn đầy đủ mọi thông tin
    const profile = initialData; 

    const displayName = profile?.fullname || "Người dùng";
    const avatarSrc = `http://localhost:5000${profile?.avatar || "/uploads/default-avatar.png"}`;

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Mọi thứ hiển thị NGAY LẬP TỨC từ dữ liệu có sẵn */}
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white text-4xl font-bold shadow-sm">
                <img
                    src={avatarSrc}
                    alt={displayName}
                    className="w-24 h-24 rounded-full object-cover border-2 border-white shadow"
                />
            </div>

            <div className="text-xl font-semibold text-gray-800">{displayName}</div>

            <div className="w-full mt-2">
                <div className="text-sm font-semibold text-gray-600 mb-2">Thông tin cá nhân</div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                    {/* Các thông tin dưới này cũng hiện luôn 0ms không cần chờ loading */}
                    <InfoRow label="Giới tính" value={profile?.gender || "Chưa cập nhật"} />
                    <InfoRow
                        label="Ngày sinh"
                        value={
                            profile?.dateOfBirth
                                ? new Date(profile.dateOfBirth).toLocaleDateString("vi-VN")
                                : "Chưa cập nhật"
                        }
                    />
                    <InfoRow label="Địa chỉ" value={profile?.address || "Chưa cập nhật"} />
                </div>
            </div>
        </div>
    );
};

const InfoRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-0.5">
        <span className="text-gray-500">{label}</span>
        <span className="text-gray-800 font-medium text-right max-w-[60%] truncate">{value}</span>
    </div>
);

export default ProfileFriend;