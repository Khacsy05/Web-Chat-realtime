import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Pencil, ArrowLeft, MoreHorizontal, Settings, LogOut, ArrowRight, Camera, X } from 'lucide-react';
import conversation from '@/service/conversation';
import useChatStore from '@/stores/useChatStore';
import useAuthStore from '@/stores/useAuthStore';
import ImageViewer from '@/components/ImageViewer';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const GroupInfoModal = ({ initialData, onSelectConversation, onOpenMembers, onMobileBack }) => {
    const currentChat = useChatStore((state) =>
        state.conversations.find(c => String(c._id) === String(initialData._id))
    );
    const currentUser = useAuthStore((state) => state.user);
    // --- QUẢN LÝ CHUYỂN TRANG GIAO DIỆN ---
    // 'info': Trang chi tiết nhóm | 'edit_name': Trang đổi tên nhóm
    const [view, setView] = useState('info');
    const [newGroupName, setNewGroupName] = useState(initialData?.nameGroup || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openTransferModal, setOpenTransferModal] = useState(false);
    const [selectedNewAdmin, setSelectedNewAdmin] = useState(null);
    const [viewer, setViewer] = useState(null);
    const [leavingAdminId, setLeavingAdminId] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: "",
        description: "",
        onConfirm: () => { },
    });
    const members = initialData?.members || [];
    const displayedMembers = members.slice(0, 3);
    const totalMembers = initialData?.memberCount || members.length;

    const mediaItems = [
        { id: 1, type: 'image', url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=150&auto=format&fit=crop&q=60' },
        { id: 2, type: 'image', url: 'https://images.unsplash.com/photo-1581291518655-9523c932dedf?w=150&auto=format&fit=crop&q=60' },
        { id: 3, type: 'image', url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150&auto=format&fit=crop&q=60' },
    ];

    const handleUpload = async (file) => {
        if (!file) return;
        try {
            const formData = new FormData();
            formData.append("avatar", file);
            formData.append("conversationId", initialData._id);
            await conversation.updateAvatar(formData);
        } catch (error) {
            console.error("Lỗi khi upload avatar:", error);
        }
    };

    const handleUpdateName = async () => {
        if (!newGroupName.trim() || isSubmitting) return;
        try {
            setIsSubmitting(true);
            await conversation.updateNameGroup({
                conversationId: initialData._id,
                newGroupName: newGroupName.trim()
            });
            // Thành công thì quay lại trang thông tin
            setView('info');
        } catch (error) {
            console.error("Lỗi khi đổi tên nhóm:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveMember = async (newAdminId = null) => {
        try {
            await conversation.removeMember(
                initialData._id,
                currentUser.idUser,
                newAdminId
            );
            if (onSelectConversation) onSelectConversation(null);
            if (onMobileBack) onMobileBack();
        } catch (error) {
            console.error("Lỗi khi roi nhom:", error);
        }
    };
    const openConfirmDialog = (type) => {
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
                    handleRemoveMember();
                };
            }
        }

        if (type === "member") {
            config.title = "Xác nhận";
            config.description = "Xóa thành viên khỏi nhóm?";
            config.onConfirm = () => handleRemoveMember();
        }

        setConfirmModal(config);
    };

    const closeConfirmDialog = () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    };
    if (view === 'info') {
        return (
            <div className="w-full text-sans select-none animate-fade-in">
                {/* Group Profile Info */}
                <div className="flex flex-col items-center pb-5 border-b border-gray-100">
                    <div className="relative mb-2.5">
                        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full  text-gray-400 overflow-hidden ">
                            {currentChat?.avatar ? (
                                <img
                                    src={`${API_BASE_URL}${currentChat.avatar}`}
                                    className="h-full w-full rounded-full object-cover border border-gray-100 shadow-sm"
                                    onClick={() => setViewer(`${API_BASE_URL}${currentChat.avatar}`)}
                                />
                            )
                                : (
                                    <div className="relative size-full">
                                        {/* Ảnh thành viên 1 */}
                                        <img
                                            src={`${API_BASE_URL}${members[0]?.avatar || '/uploads/default-avatar.png'}`}
                                            className="absolute top-0 left-1 size-9 rounded-full border-2 border-white object-cover shadow-sm z-20"
                                            alt="mem1"
                                        />
                                        {/* Ảnh thành viên 2 */}
                                        <img
                                            src={`${API_BASE_URL}${members[1]?.avatar || '/uploads/default-avatar.png'}`}
                                            className="absolute top-0 right-1 size-9 rounded-full border-2 border-white object-cover shadow-sm z-10"
                                            alt="mem2"
                                        />
                                        {/* Ảnh thành viên 3 */}
                                        <img
                                            src={`${API_BASE_URL}${members[2]?.avatar || '/uploads/default-avatar.png'}`}
                                            className="absolute bottom-0 left-1 size-9 rounded-full border-2 border-white object-cover shadow-sm z-30"
                                            alt="mem3"
                                        />
                                        {/* Vòng tròn số lượng */}
                                        <div className="absolute bottom-0 right-1 size-9 rounded-full border-2 border-white bg-[#e2e6ea] flex items-center justify-center text-[12px] font-bold text-gray-600 shadow-sm z-40">
                                            {totalMembers}
                                        </div>
                                    </div>
                                )}
                        </div>

                        <label className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm text-gray-600 hover:bg-gray-50 cursor-pointer z-10">
                            <Camera size={13} />
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleUpload(e.target.files?.[0])}
                            />
                        </label>
                    </div>

                    {/* Ấn vào vùng này hoặc cây bút chì sẽ CHUYỂN TRANG */}
                    <div
                        onClick={() => setView('edit_name')}
                        className="flex items-center gap-1.5 cursor-pointer group mb-3.5"
                    >
                        <span className="text-[15px] font-medium text-gray-800 group-hover:text-blue-600">
                            {currentChat?.nameGroup || initialData?.nameGroup || "Nhóm chưa đặt tên"}
                        </span>
                        <Pencil size={13} className="text-gray-400 group-hover:text-blue-500" />
                    </div>
                </div>

                {/* Members Section */}
                <div className="py-4 border-b border-gray-100">
                    <h3 className="text-[13.5px] font-medium text-gray-800 mb-2.5">Thành viên ({totalMembers})</h3>

                    <div className="flex items-center -space-x-1.5 isolate">
                        {displayedMembers.map((member, index) => (
                            <img
                                key={member?._id || index}
                                src={`${API_BASE_URL}${member?.avatar || '/uploads/default-avatar.png'}`}
                                alt={member?.fullname || 'Member'}
                                className="h-9 w-9 rounded-full object-cover border-2 border-white shadow-sm"
                                style={{ zIndex: displayedMembers.length - index }} // Giữ z-index giảm dần cho avatar
                            />
                        ))}

                        {/* Nút 3 chấm giờ đã sát vào hàng avatar và ăn theo khoảng cách -space-x-1.5 */}
                        <button
                            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-sm z-0"
                            onClick={onOpenMembers}
                        >
                            <MoreHorizontal size={15} />
                        </button>
                    </div>
                </div>

                {/* Media Section */}
                <div className="py-4 border-b border-gray-100">
                    <h3 className="text-[13.5px] font-medium text-gray-800 mb-2.5">Ảnh/Video</h3>
                    <div className="grid grid-cols-4 gap-2">
                        {mediaItems.map((item) => (
                            <div key={item.id} className="aspect-square rounded overflow-hidden bg-gray-100 border border-gray-200 cursor-pointer hover:opacity-90">
                                <img src={item.url} alt="Media" className="h-full w-full object-cover" />
                            </div>
                        ))}
                        <button className="flex aspect-square items-center justify-center rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Action Options */}
                <div className="pt-2 flex flex-col gap-0.5">
                    <button className="flex w-full items-center gap-2.5 rounded-md px-2 py-2.5 text-[14.5px] text-gray-700 hover:bg-gray-100 transition-colors text-left">
                        <Settings size={16} className="text-gray-500" />
                        <span>Quản lý nhóm</span>
                    </button>
                    {String(currentUser.idUser) === String(initialData.adminGroup) ? (
                        <button
                            type="button"
                            className="flex w-full items-center gap-2.5 rounded-md px-2 py-2.5 text-[14.5px] text-red-600 hover:bg-red-50 transition-colors text-left"
                            onClick={() => {
                                setLeavingAdminId(currentUser.idUser);
                                openConfirmDialog("admin");

                            }}
                        >
                            Rời nhóm
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="flex w-full items-center gap-2.5 rounded-md px-2 py-2.5 text-[14.5px] text-red-600 hover:bg-red-50 transition-colors text-left"
                            onClick={() => {
                                openConfirmDialog(
                                    "member"
                                );
                            }}
                        >
                            Rời nhóm
                        </button>
                    )}
                </div>

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
                                    .filter(m => m._id !== initialData.adminGroup)
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
                <ImageViewer src={viewer} onClose={() => setViewer(null)} />
            </div>
        );
    }

    if (view === 'edit_name') {
        return (
            <div className="w-full bg-white text-sans select-none animate-fade-in">

                {/* Header thanh điều hướng quay lại */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-5">
                    <button
                        onClick={() => setView('info')}
                        className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-[16px] font-semibold text-gray-800 flex-1 text-center pr-6">Đổi tên nhóm</h2>
                </div>

                {/* Nội dung giao diện đổi tên */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault(); // ❗ chặn reload trang
                        handleUpdateName();
                    }}
                >
                    <div className="flex flex-col items-center py-4 text-center">

                        {/* Khối cụm Avatar 4 góc tròn giống hệt Zalo */}
                        <div className="relative mb-6 flex items-center justify-center">
                            <div className="gap-0.5 h-14 w-14 rounded-full overflow-hidden  p-0.5 shadow-sm">
                                {currentChat?.avatar ? (
                                    <img
                                        src={`${API_BASE_URL}${currentChat.avatar}`}
                                        className="h-full w-full rounded-full object-cover border border-gray-100 shadow-sm"
                                    />
                                )
                                    : (
                                        <div className="relative size-full">
                                            {/* Ảnh thành viên 1 */}
                                            <img
                                                src={`${API_BASE_URL}${members[0]?.avatar || '/uploads/default-avatar.png'}`}
                                                className="absolute top-0 left-0.5 size-7 rounded-full border-2 border-white object-cover shadow-sm z-20"
                                                alt="mem1"
                                            />
                                            {/* Ảnh thành viên 2 */}
                                            <img
                                                src={`${API_BASE_URL}${members[1]?.avatar || '/uploads/default-avatar.png'}`}
                                                className="absolute top-0 right-0.5 size-7 rounded-full border-2 border-white object-cover shadow-sm z-10"
                                                alt="mem2"
                                            />
                                            {/* Ảnh thành viên 3 */}
                                            <img
                                                src={`${API_BASE_URL}${members[2]?.avatar || '/uploads/default-avatar.png'}`}
                                                className="absolute bottom-0 left-0.5 size-7 rounded-full border-2 border-white object-cover shadow-sm z-30"
                                                alt="mem3"
                                            />
                                            {/* Vòng tròn số lượng */}
                                            <div className="absolute bottom-0 right-0.5 size-7 rounded-full border-2 border-white bg-[#e2e6ea] flex items-center justify-center text-[12px] font-bold text-gray-600 shadow-sm z-40">
                                                {totalMembers}
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>

                        <p className="text-[14px] text-gray-600 leading-relaxed mb-5 px-3">
                            Bạn có chắc chắn muốn đổi tên nhóm, khi xác nhận tên nhóm mới sẽ hiển thị với tất cả thành viên.
                        </p>

                        {/* Ô Input nhập tên viền xanh giống ảnh mẫu */}
                        <input
                            type="text"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="Nhập tên nhóm mới"
                            className="w-full rounded border border-blue-500 px-3 py-2.5 text-[14px] outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
                            autoFocus
                        />
                    </div>

                    {/* Khối các nút điều hướng Xác nhận / Hủy dưới cùng */}

                    <div className="flex items-center justify-end gap-3 pt-5 mt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setView('info')}
                            className="rounded bg-[#e8eaed] px-5 py-2 text-[14px] font-medium text-gray-700 hover:bg-gray-300 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type='submit'

                            disabled={!newGroupName.trim() || isSubmitting}
                            className="rounded bg-blue-600 px-5 py-2 text-[14px] font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? "Đang lưu..." : "Xác nhận"}
                        </button>
                    </div>
                </form>


            </div>
        );
    }
};

export default GroupInfoModal;