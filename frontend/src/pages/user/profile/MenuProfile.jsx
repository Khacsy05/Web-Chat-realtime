import React from 'react'
import ProfileFriend from './ProfileFriend';
import GroupInfoModal from './GroupInfoModal';

const MenuProfile = ({ type, data }) => {
  if (type === 'group') {
    return (
      <GroupInfoModal initialData={data} />
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
export default MenuProfile