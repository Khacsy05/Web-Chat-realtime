import Modal from "@/components/Modal";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import AddMembersModal from "./AddMembersModal";
import { MoreHorizontal, X } from "lucide-react";
import conversation from "@/service/conversation";
import ProfileFriend from "../profile/ProfileFriend";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const GroupMembersPanel = ({ conversations, onBack }) => {
    const members = conversations.members || [];

    const [openProfile, setOpenProfile] = useState(null);
    const [openAddMembers, setOpenAddMembers] = useState(false);

    const [openMenuUserId, setOpenMenuUserId] = useState(null);

    const [openTransferModal, setOpenTransferModal] = useState(false);
    const [selectedNewAdmin, setSelectedNewAdmin] = useState(null);

    const [leavingAdminId, setLeavingAdminId] = useState(null);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: "",
        description: "",
        onConfirm: () => { },
    });
    const adminId = conversations.adminGroup;

    const sortedMembers = [
        ...members.filter(m => String(m._id) === String(adminId)),
        ...members.filter(m => String(m._id) !== String(adminId)),
    ];

    // ================= API =================
    const handleRemoveMember = async (memberId, newAdminId = null) => {
        try {
            await conversation.removeMember(
                conversations._id,
                memberId,
                newAdminId
            );
        } catch (error) {
            console.log(error);
        }
    };

    // ================= CONFIRM =================
    const openConfirmDialog = (type, memberId) => {
        let config = {
            isOpen: true,
            title: "",
            description: "",
            onConfirm: () => { },
        };

        if (type === "admin") {
            if (members.length > 1) {
                config.title = "Rời nhóm";
                config.description = "Bạn là trưởng nhóm. Bạn cần chọn trưởng nhóm mới trước khi rời nhóm.";
                config.onConfirm = () => {
                    setOpenTransferModal(true);
                };
            } else {
                // Trường hợp nhóm chỉ còn duy nhất 1 mình admin tự kỷ
                config.title = "Giải tán nhóm";
                config.description = "Bạn là thành viên duy nhất. Rời khỏi nhóm đồng nghĩa với việc giải tán và xóa nhóm này hoàn toàn?";
                config.onConfirm = () => {
                    handleRemoveMember(memberId);
                };
            }
        }

        if (type === "member") {
            config.title = "Xác nhận";
            config.description = "Xóa thành viên khỏi nhóm?";
            config.onConfirm = () => handleRemoveMember(memberId);
        }

        setConfirmModal(config);
    };

    const closeConfirmDialog = () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    };

    // ================= OUTSIDE CLICK =================
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest(".menu-box")) {
                setOpenMenuUserId(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex flex-col h-full bg-white">

            {/* HEADER */}
            <div className="h-[56px] flex items-center px-4 border-b">
                <button onClick={onBack}>←</button>
                <h2 className="ml-3 font-semibold">Thành viên</h2>
            </div>

            {/* ADD */}
            <button
                type="button"
                className="m-4 py-2 bg-gray-100 rounded"
                onClick={() => setOpenAddMembers(true)}
            >
                ➕ Thêm thành viên
            </button>

            {/* LIST */}
            <div className="flex-1 overflow-y-auto px-4">
                {sortedMembers.map((m) => (
                    <div
                        key={m._id}
                        className="group flex items-center gap-3 py-3 hover:bg-gray-50"
                    >
                        <img
                            onClick={() => setOpenProfile(m)}
                            src={`${API_BASE_URL}${m.avatar || "/uploads/default-avatar.png"}`}
                            className="w-11 h-11 rounded-full"
                        />

                        <div className="flex-1">
                            <div>{m.fullname}</div>
                            <div className="text-xs text-gray-400">
                                {m._id === adminId && (
                                    <span className="text-xs px-2 py-[2px] rounded bg-blue-100 text-blue-600">
                                        Trưởng nhóm
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* MENU */}
                        <div className="relative menu-box">
                            <button
                                onClick={() =>
                                    setOpenMenuUserId(
                                        openMenuUserId === m._id
                                            ? null
                                            : m._id
                                    )
                                }
                                className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1.5 rounded-full hover:bg-gray-100"
                            >
                                <MoreHorizontal />
                            </button>

                            {openMenuUserId === m._id && (
                                <div className="absolute right-0 top-7 bg-white border rounded shadow w-36">

                                    {String(m._id) === String(conversations.adminGroup) ? (
                                        <button
                                            type="button"
                                            className="w-full text-left p-2"
                                            onClick={() => {
                                                setLeavingAdminId(m._id);
                                                openConfirmDialog("admin", m._id);
                                                setOpenMenuUserId(null);
                                            }}
                                        >
                                            🚪 Rời nhóm
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="w-full text-left p-2 text-red-500"
                                            onClick={() => {
                                                openConfirmDialog(
                                                    "member",
                                                    m._id
                                                );
                                                setOpenMenuUserId(null);
                                            }}
                                        >
                                            ❌ Xóa
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* TRANSFER ADMIN MODAL */}
            {openTransferModal && createPortal(
                <div className="fixed inset-0 z-[999] flex items-center justify-center">

                    {/* Overlay chặn hover phía sau */}
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => {
                            setOpenTransferModal(false);
                            setSelectedNewAdmin(null);
                        }}
                    />

                    {/* Modal box */}
                    <div className="relative bg-white w-[420px] rounded-xl shadow-lg p-4">

                        <h3 className="text-base font-semibold mb-3">
                            Chọn trưởng nhóm mới
                        </h3>

                        {/* LIST */}
                        <div className="max-h-[300px] overflow-y-auto pr-1">
                            {members
                                .filter(m => m._id !== conversations.adminGroup)
                                .map(m => {
                                    const isSelected = selectedNewAdmin === m._id;

                                    return (
                                        <div
                                            key={m._id}
                                            onClick={() => setSelectedNewAdmin(m._id)}
                                            className={`
                                flex items-center gap-3 p-2 rounded-lg cursor-pointer
                                transition
                                ${isSelected ? "bg-blue-50" : "hover:bg-gray-100"}
                                `}
                                        >
                                            {/* Checkbox (chỉ hiển thị) */}
                                            <input
                                                type="radio"
                                                checked={isSelected}
                                                readOnly
                                                className="w-4 h-4 text-blue-600"
                                            />

                                            {/* Avatar */}
                                            <img
                                                src={
                                                    m.avatar
                                                        ? `${API_BASE_URL}${m.avatar}`
                                                        : "/uploads/default-avatar.png"
                                                }
                                                className="w-10 h-10 rounded-full object-cover border"
                                            />

                                            {/* Name */}
                                            <span className="text-sm font-medium text-gray-800 flex-1">
                                                {m.fullname}
                                            </span>
                                        </div>
                                    );
                                })}
                        </div>

                        {/* ACTION */}
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                className="px-3 py-1 rounded border text-sm"
                                onClick={() => {
                                    setOpenTransferModal(false);
                                    setSelectedNewAdmin(null);
                                }}
                            >
                                Hủy
                            </button>

                            <button
                                type="button"
                                disabled={!selectedNewAdmin}
                                className={`
                                px-4 py-1 rounded text-sm text-white
                                ${selectedNewAdmin
                                        ? "bg-blue-500 hover:bg-blue-600"
                                        : "bg-gray-300 cursor-not-allowed"}
                            `}
                                onClick={async () => {
                                    await handleRemoveMember(
                                        leavingAdminId,
                                        selectedNewAdmin
                                    );

                                    setOpenTransferModal(false);
                                    setSelectedNewAdmin(null);
                                    setLeavingAdminId(null);
                                }}
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* CONFIRM MODAL */}
            {confirmModal.isOpen && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                    {/* Lớp nền mờ đen phía sau */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                        onClick={closeConfirmDialog}
                    />

                    {/* Khung nội dung Popup */}
                    <div className="relative w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 shadow-xl transition-all border border-gray-100 scale-in-center">
                        {/* Nút X đóng nhanh */}
                        <button
                            type="button"
                            onClick={closeConfirmDialog}
                            className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                            aria-label="Đóng popup"
                        >
                            <X size={18} strokeWidth={2.5} />
                        </button>

                        <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0 pr-6">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {confirmModal.title}
                                </h3>
                                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                                    {confirmModal.description}
                                </p>
                            </div>
                        </div>

                        {/* Các nút bấm hành động của Popup */}
                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                type="button"
                                className="h-9 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                                onClick={closeConfirmDialog}
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="button"
                                className="h-9 rounded-lg bg-[#e03131] px-4 text-sm font-medium text-white hover:bg-[#c92a2a] transition shadow-sm"
                                onClick={() => {
                                    confirmModal.onConfirm(); // Kích hoạt chạy hàm xóa/hủy đã nạp
                                    closeConfirmDialog();     // Chạy xong đóng popup
                                }}
                            >
                                Đồng ý
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
            {openAddMembers && (
                <AddMembersModal
                    conversations={conversations}
                    onClose={() => setOpenAddMembers(false)}
                />
            )}
            {openProfile && (
                <Modal
                    title="Thông tin tài khoản"
                    onClose={() => setOpenProfile(null)}
                    size="md"
                >
                    <ProfileFriend initialData={openProfile} />
                </Modal>
            )}
        </div>
    );
};

export default GroupMembersPanel;