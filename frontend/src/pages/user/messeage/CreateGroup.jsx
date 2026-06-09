import useFriendStore from '@/stores/useFriendStore';
import { toast } from 'sonner';
import React, { useEffect, useState, useMemo } from 'react';
import { Camera, Search, X, ChevronRight } from 'lucide-react'; // Cài lucide-react nếu chưa có, hoặc thay bằng icon SVG
import conversation from '@/service/conversation';
import useChatStore from '@/stores/useChatStore';

const CreateGroup = ({ onClose }) => {
  const { friends, loading, fetchFriends } = useFriendStore();
  const setConversations = useChatStore((state) => state.setConversations);
  
  // State quản lý việc nhập liệu và chọn thành viên
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [groupAvatar, setGroupAvatar] = useState(null);
  const [avatar, setAvatar] = useState([]);
  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  // Xử lý Checkbox khi click vào hàng (toggle)
  const handleToggleSelect = (friendId) => {
    setSelectedIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  // Lọc và phân loại danh sách bạn bè dựa trên dữ liệu thật từ store
  const filteredFriends = useMemo(() => {
    if (!friends) return { recent: [], alphabetized: {} };

    const matchSearch = friends.filter(friend =>
      friend.fullname.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const alphabetized = matchSearch.reduce((acc, friend) => {
      const firstLetter = friend.fullname.trim().charAt(0).toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(friend);
      return acc;
    }, {});

    // Sắp xếp các key A-Z
    const sortedAlphabet = Object.keys(alphabetized)
      .sort()
      .reduce((acc, key) => {
        acc[key] = alphabetized[key];
        return acc;
      }, {});

    return {  alphabetized: sortedAlphabet };
  }, [friends, searchQuery]);

  // Hàm handle submit sau này bạn tự viết API
  

  const handleCreateGroup = async (file,nameGroup,members) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      formData.append("nameGroup", nameGroup);
      formData.append("members", JSON.stringify(members));
  
      const res = await conversation.createGroup(formData);
      const newGroup = res?.data;

      if (newGroup?._id) {
        setConversations((prev) => [
          newGroup,
          ...prev.filter((c) => String(c._id) !== String(newGroup._id)),
        ]);
      }

      toast.success("Tạo nhóm thành công");
      onClose?.();
    } catch (error) {
      toast.error("Tạo nhóm không thành công");
    }
  }
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGroupAvatar(file);
      setAvatar(URL.createObjectURL(file))
    }
  };
  return (
    <div className="h-[80vh] max-h-[600px] flex flex-col overflow-hidden">
      {/* Body */}
      <div className="flex flex-col flex-1 min-h-0">
        
        {/* Nhập tên nhóm & Icon Camera */}
        <div className="flex items-center gap-3 mb-4">
          <label className="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition border border-gray-200 overflow-hidden cursor-pointer">
            {groupAvatar ? (
            <img
              src={avatar}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <Camera size={20} />
          )}

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          </label>
          
          <input
            type="text"
            placeholder="Nhập tên nhóm..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="flex-1 py-2 text-[15px] border-b border-gray-300 focus:border-blue-500 outline-none transition placeholder-gray-400"
          />
        </div>

        {/* Thanh tìm kiếm */}
        <div className="relative mb-3">
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Nhập tên, số điện thoại, hoặc danh sách số điện thoại"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-full text-sm outline-none focus:border-blue-500 placeholder-gray-400"
          />
        </div>

      

        {/* Danh sách bạn bè để chọn */}
        <div className="flex-1 overflow-y-auto pr-1 ">
          {loading ? (
            <div className="text-center text-sm py-8 text-gray-400">Đang tải danh sách bạn bè...</div>
          ) : friends.length === 0 ? (
            <div className="text-center text-sm py-8 text-gray-400">Bạn chưa có bạn bè nào</div>
          ) : (
            <>
              {Object.keys(filteredFriends.alphabetized).length === 0 && (
                <div className="text-center text-sm py-8 text-gray-400">
                  Không tìm thấy kết quả
                </div>
              )}
              {Object.keys(filteredFriends.alphabetized).map((letter) => (
                <div key={letter} className="mb-4">
                  <div className="text-xs font-bold text-blue-800 mb-1 px-1">{letter}</div>
                  <div className="space-y-1">
                    {filteredFriends.alphabetized[letter].map((friend) => (
                      <div 
                        key={friend._id} 
                        onClick={() => handleToggleSelect(friend._id)}
                        className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition"
                      >
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(friend._id)}
                          onChange={() => {}} 
                          className="w-4 h-4 rounded-full border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                        />
                        <img 
                          src={friend.avatar ? `http://localhost:5000${friend.avatar}` : 'https://via.placeholder.com/150'} 
                          className="w-10 h-10 rounded-full object-cover border border-gray-100" 
                          alt="" 
                        />
                        <span className="text-[14px] font-normal text-gray-800 flex-1">{friend.fullname}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      {/* Footer chứa nút bấm */}
      <div className="px-4 py-3 border-t border-gray-100 flex justify-end gap-3">
        <button 
          onClick={onClose} 
          className="px-5 py-2 text-sm font-semibold bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
        >
          Hủy
        </button>
        <button 
          onClick={() => handleCreateGroup(groupAvatar,groupName,selectedIds)}
          disabled={selectedIds.length < 2}
          className={`px-5 py-2 text-sm font-semibold rounded transition ${
            selectedIds.length > 1 
              ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer' 
              : 'bg-blue-200 text-white cursor-not-allowed'
          }`}
        >
          Tạo nhóm
        </button>
      </div>

    </div>
  );
};

export default CreateGroup;
