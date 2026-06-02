import Modal from "@/components/Modal";
import ProfileFriend from "../friend/ProfileFriend";
import { useState } from "react";

const GroupMembersPanel = ({ conversation, onBack }) => {
    const members = conversation.members || [];
    const [openProfile, setOpenProfile] = useState(null);
    return (
        <div className="flex flex-col h-full bg-white">
        
        {/* Header */}
            <div className="h-[56px] flex items-center px-4 border-b">
                <button onClick={onBack} className="mr-3">
                ←
                </button>
                <h2 className="font-semibold text-[16px]">Thành viên</h2>
            </div>

            {/* Add member */}
            <button className="m-4 py-2 rounded bg-gray-100 text-sm font-medium">
                ➕ Thêm thành viên
            </button>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4">
                <div className="text-sm text-gray-500 mb-2">
                    Danh sách thành viên ({members.length})
                </div>

                {members.map((m) => (
                <div
                    key={m.userId}
                    className="flex items-center gap-3 py-3"
                >
                    <button onClick={() => setOpenProfile(m)}>
                        <img
                            src={`http://localhost:5000${m?.avatar || '/uploads/default-avatar.png'}`}
                            
                            className="size-11 rounded-full object-cover"
                        />
                    </button>

                    <div className="flex-1">
                    <div className="font-medium text-sm">{m.fullname}</div>
                    <div className="text-xs text-gray-400">
                        {m.role === "admin"
                        ? "Trưởng cộng đồng"
                        : m.role === "sub_admin"
                        ? "Phó cộng đồng"
                        : ""}
                    </div>
                    </div>

                    <button className="text-blue-500 text-sm font-medium">
                    
                    </button>
                </div>
                ))}
            </div>

            {openProfile && (
            <Modal
                title="Thông tin tài khoản"
                onClose={() => setOpenProfile(null)}
                size="md"
            >
                <ProfileFriend initialData={openProfile}/>
            </Modal>
            
            )}
        </div>
    );
};

export default GroupMembersPanel