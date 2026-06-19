import conversation from "@/service/conversation";
import useFriendStore from "@/stores/useFriendStore";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

const AddMembersModal = ({ conversations, onClose }) => {
  const { friends, loading, fetchFriends } = useFriendStore();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  // 🧠 chống crash nếu chưa load
  const existingIds = useMemo(() => {
    return conversations?.members?.map(m => String(m._id)) || [];
  }, [conversations]);

  // ❌ loại người đã trong nhóm
  const availableFriends = useMemo(() => {
    return friends.filter(f => !existingIds.includes(String(f._id)));
  }, [friends, existingIds]);

  // toggle chọn user
  const handleToggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  // search + group alphabet
  const filteredFriends = useMemo(() => {
    const matchSearch = availableFriends.filter(friend =>
      friend.fullname.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const grouped = matchSearch.reduce((acc, friend) => {
      const letter = friend.fullname.charAt(0).toUpperCase();
      if (!acc[letter]) acc[letter] = [];
      acc[letter].push(friend);
      return acc;
    }, {});

    return Object.keys(grouped)
      .sort()
      .reduce((acc, key) => {
        acc[key] = grouped[key];
        return acc;
      }, {});
  }, [availableFriends, searchQuery]);

  // add member
  const handleAdd = async () => {
    try {
      if (!selectedIds.length) return;

      const response = await conversation.addMember(conversations._id, selectedIds);

      onClose();
    } catch (err) {
      console.error("Add member error:", err);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">

      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* modal */}
      <div className="relative w-full max-w-[520px] max-h-[85vh] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden">

        {/* search */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              className="w-full pl-9 pr-3 py-2 border rounded-full text-sm"
              placeholder="Tìm bạn bè..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* list */}
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <p className="text-sm text-gray-400">Đang tải...</p>
          ) : (
            Object.keys(filteredFriends).length === 0 ? (
              <p className="text-sm text-gray-400">Không có kết quả</p>
            ) : (
              Object.keys(filteredFriends).map(letter => (
                <div key={letter} className="mb-3">
                  <div className="text-xs font-bold text-gray-500 mb-1">
                    {letter}
                  </div>

                  {filteredFriends[letter].map(friend => (
                    <div
                      key={friend._id}
                      onClick={() => handleToggleSelect(friend._id)}
                      className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(friend._id)}
                        readOnly
                      />

                      <img
                        src={
                          friend.avatar
                            ? `${API_BASE_URL}${friend.avatar}`
                            : "https://via.placeholder.com/40"
                        }
                        className="w-9 h-9 rounded-full"
                      />

                      <span className="text-sm">{friend.fullname}</span>
                    </div>
                  ))}
                </div>
              ))
            )
          )}
        </div>

        {/* footer */}
        <div className="p-3 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Hủy
          </button>

          <button
            onClick={handleAdd}
            disabled={!selectedIds.length}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Thêm thành viên
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default AddMembersModal;