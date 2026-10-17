import React, { useState } from "react";
import Modal from "@/components/Modal";
import { Pin, PinOff, UsersRound } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import conversationService from "@/service/conversation";
import useChatStore from "@/stores/useChatStore";
import useAuthStore from "@/stores/useAuthStore";
import { toast } from "sonner";

const PinLimitModal = ({
  isOpen,
  onClose,
  targetConversation = null,
  onPinTarget = null,
}) => {
  const conversations = useChatStore((state) => state.conversations);
  const updateConversationPin = useChatStore((state) => state.updateConversationPin);
  const currentUser = useAuthStore((state) => state.user);
  const [loadingId, setLoadingId] = useState(null);

  if (!isOpen) return null;

  // Lọc ra các cuộc hội thoại người dùng hiện tại đang ghim
  const pinnedConversations = conversations.filter((c) =>
    c.pinnedBy?.some((p) => String(p.userId) === String(currentUser?.idUser))
  );

  const handleUnpin = async (conversationId, name) => {
    setLoadingId(conversationId);
    try {
      const res = await conversationService.togglePin(conversationId);
      if (res.data?.success) {
        updateConversationPin(conversationId, currentUser?.idUser, false);
        toast.success(`Đã bỏ ghim "${name}"`);
      }
    } catch (error) {
      toast.error(error?.data?.message || "Lỗi khi bỏ ghim");
    } finally {
      setLoadingId(null);
    }
  };

  const handlePinTargetNow = async () => {
    if (!targetConversation?._id) return;
    setLoadingId(targetConversation._id);
    try {
      const res = await conversationService.togglePin(targetConversation._id);
      if (res.data?.success) {
        updateConversationPin(
          targetConversation._id,
          currentUser?.idUser,
          true,
          res.data.pinnedAt
        );
        toast.success("Đã ghim cuộc trò chuyện thành công");
        onClose?.();
      }
    } catch (error) {
      toast.error(error?.data?.message || "Lỗi khi ghim cuộc trò chuyện");
    } finally {
      setLoadingId(null);
    }
  };

  const hasSlotAvailable = pinnedConversations.length < 5;

  return (
    <Modal title="Quản lý ghim hội thoại" onClose={onClose} size="md">
      <div className="flex flex-col gap-4 py-1">
        {/* THÔNG BÁO GIỚI HẠN */}
        <div className="rounded-lg bg-amber-50 p-3.5 border border-amber-200">
          <div className="flex items-start gap-2.5">
            <div className="p-1 rounded-full bg-amber-100 text-amber-600 mt-0.5 shrink-0">
              <Pin size={16} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-900">
                Chỉ được ghim tối đa 5 cuộc trò chuyện
              </h4>
              <p className="text-xs text-amber-750 text-amber-800 mt-0.5 leading-relaxed">
                {hasSlotAvailable
                  ? `Bạn đã có chỗ trống (${pinnedConversations.length}/5). Bạn có thể ghim ngay cuộc trò chuyện mới!`
                  : "Bạn đã ghim đủ 5 cuộc trò chuyện. Hãy chọn bỏ ghim bớt một cuộc trò chuyện dưới đây để giải phóng chỗ trống."}
              </p>
            </div>
          </div>
        </div>

        {/* DANH SÁCH CÁC CUỘC HỘI THOẠI ĐANG GHIM */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Đang ghim ({pinnedConversations.length}/5)
          </div>

          <div className="flex flex-col divide-y divide-gray-100 max-h-[260px] overflow-y-auto border border-gray-100 rounded-lg">
            {pinnedConversations.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-400">
                Chưa có cuộc trò chuyện nào được ghim
              </div>
            ) : (
              pinnedConversations.map((c) => {
                const isGroup = c.isGroup;
                const otherMember =
                  c.members?.find((m) => String(m._id) !== String(currentUser?.idUser)) ||
                  c.members?.[0];
                const displayName = isGroup
                  ? c.nameGroup || "Nhóm chưa đặt tên"
                  : otherMember?.fullname || "Người dùng";
                const avatar = isGroup
                  ? getImageUrl(c.avatar)
                  : getImageUrl(otherMember?.avatar);

                return (
                  <div
                    key={c._id}
                    className="flex items-center justify-between p-2.5 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                      <div className="relative size-10 shrink-0">
                        <img
                          src={avatar}
                          alt={displayName}
                          className="size-10 rounded-full object-cover border border-gray-100 shadow-sm"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full bg-[#0068ff] text-white flex items-center justify-center shadow-sm">
                          <Pin size={9} />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {displayName}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {c.lastMessage || "Chưa có tin nhắn"}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={loadingId === c._id}
                      onClick={() => handleUnpin(c._id, displayName)}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition disabled:opacity-50 cursor-pointer"
                    >
                      <PinOff size={14} />
                      Bỏ ghim
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* NÚT THAO TÁC */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition cursor-pointer"
          >
            Đóng
          </button>

          {targetConversation && hasSlotAvailable && (
            <button
              type="button"
              disabled={loadingId === targetConversation._id}
              onClick={handlePinTargetNow}
              className="px-4 py-2 text-sm font-medium text-white bg-[#0068ff] hover:bg-[#0052cc] rounded-lg transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <Pin size={15} />
              Ghim cuộc trò chuyện này
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PinLimitModal;
