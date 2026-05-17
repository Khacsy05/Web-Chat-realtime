import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

const ViewProfile = ({ onEdit, profile, onAvatarChange }) => {
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
        <label className="absolute -right-1 -bottom-1 h-8 w-8 cursor-pointer rounded-full bg-[#3b5bdb] text-white shadow-md flex items-center justify-center hover:bg-[#2f4bc7]">
          <Camera size={16} />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onAvatarChange?.(e.target.files?.[0])}
          />
        </label>
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

      <div>
        <Button onClick={onEdit} className="bg-white text-black px-10 hover:bg-[#f8f9fa]">
          Sua chi tiet
        </Button>
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

export default ViewProfile;
