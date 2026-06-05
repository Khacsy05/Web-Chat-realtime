import Modal from "@/components/Modal";
import ProfileFriend from "../friend/ProfileFriend";
import { useState, useEffect } from "react";
import AddMembersModal from "./AddMembersModal";
import { MoreHorizontal, X } from "lucide-react";
import conversation from "@/service/conversation";

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
        onConfirm: () => {},
    });

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
            onConfirm: () => {},
        };

        if (type === "admin") {
            config.title = "Rời nhóm";
            config.description = "Bạn cần chọn trưởng nhóm mới";
            config.onConfirm = () => {
                setOpenTransferModal(true);
            };
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
                className="m-4 py-2 bg-gray-100 rounded"
                onClick={() => setOpenAddMembers(true)}
            >
                ➕ Thêm thành viên
            </button>

            {/* LIST */}
            <div className="flex-1 overflow-y-auto px-4">
                {members.map((m) => (
                    <div
                        key={m._id}
                        className="group flex items-center gap-3 py-3 hover:bg-gray-50"
                    >
                        <img
                            onClick={() => setOpenProfile(m)}
                            src={`http://localhost:5000${
                                m.avatar || "/uploads/default-avatar.png"
                            }`}
                            className="w-11 h-11 rounded-full"
                        />

                        <div className="flex-1">
                            <div>{m.fullname}</div>
                            <div className="text-xs text-gray-400">
                                {m._id === conversations.adminGroup
                                    ? "Trưởng nhóm"
                                    : ""}
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
                                className="opacity-0 group-hover:opacity-100"
                            >
                                <MoreHorizontal />
                            </button>

                            {openMenuUserId === m._id && (
                                <div className="absolute right-0 top-7 bg-white border rounded shadow w-36">

                                    {m._id === conversations.adminGroup ? (
                                        <button
                                            className="w-full text-left p-2"
                                            onClick={() => {
                                                setLeavingAdminId(m._id);
                                                openConfirmDialog("admin");
                                                setOpenMenuUserId(null);
                                            }}
                                        >
                                            🚪 Rời nhóm
                                        </button>
                                    ) : (
                                        <button
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
            {openTransferModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white w-[400px] p-4 rounded">

                        <h3>Chọn trưởng nhóm mới</h3>

                        <div className="max-h-[250px] overflow-y-auto">
                            {members
                                .filter(
                                    (m) =>
                                        m._id !== conversations.adminGroup
                                )
                                .map((m) => (
                                    <div
                                        key={m._id}
                                        onClick={() =>
                                            setSelectedNewAdmin(m._id)
                                        }
                                        className={`p-2 cursor-pointer ${
                                            selectedNewAdmin === m._id
                                                ? "bg-gray-200"
                                                : ""
                                        }`}
                                    >
                                        {m.fullname}
                                    </div>
                                ))}
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => {
                                    setOpenTransferModal(false);
                                    setSelectedNewAdmin(null);
                                }}
                            >
                                Hủy
                            </button>

                            <button
                                disabled={!selectedNewAdmin}
                                className="bg-blue-500 text-white px-3 py-1 rounded"
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
                </div>
            )}

            {/* CONFIRM MODAL */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40">
                    <div className="bg-white p-4 rounded w-[350px]">

                        <h3>{confirmModal.title}</h3>
                        <p className="text-sm text-gray-500">
                            {confirmModal.description}
                        </p>

                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={closeConfirmDialog}>
                                Hủy
                            </button>

                            <button
                                className="bg-red-500 text-white px-3 py-1 rounded"
                                onClick={() => {
                                    confirmModal.onConfirm();
                                    closeConfirmDialog();
                                }}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {openAddMembers && ( 
                <AddMembersModal 
                    conversations={conversations} 
                    onClose={() => setOpenAddMembers(false)} 
                /> 
            )}
        </div>
    );
};

export default GroupMembersPanel;