import React, { useState } from 'react'
import GroupInfoModal from './GroupInfoModal';
import ProfileFriend from './ProfileFriend';
import GroupMembersPanel from '../messeage/GroupMembersPanel';

const MenuProfile = ({ type, data, onSelectConversation ,selectedConversation,onMobileBack}) => {
  const [view, setView] = useState("profile"); 

  // 1. Nếu là cuộc trò chuyện Nhóm
  if (type === 'group') {
    return (
      <> {/* Thêm thẻ bọc Fragment ở đây */}
        {view === "profile" && (
           <GroupInfoModal 
            initialData={data} 
            onSelectConversation={onSelectConversation} 
            onOpenMembers={() => setView("members")}
            onMobileBack={onMobileBack}
          />
        )}

        {view === "members" && (
          <GroupMembersPanel
            conversations={selectedConversation}
            onSelectConversation={onSelectConversation}
            onBack={() => setView("profile")} // Cho phép quay lại profile
          />
        )}
      </>
    );
  }

  // 2. Nếu là cuộc trò chuyện Cá nhân
  if (type === 'personal') {
    return (
      <ProfileFriend initialData={data}/>
    );
  }

  return <div className="text-gray-500 text-center py-4">Không tìm thấy thông tin phù hợp.</div>;
};

export default MenuProfile;