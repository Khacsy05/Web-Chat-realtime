import React from 'react'
import FriendSiderBar from './FriendSiderBar'
import { Outlet } from 'react-router-dom'


const HomePageFriend = () => {
  return (
    <div className="relative flex h-full min-h-0 overflow-hidden">
      {/* Bên trái – ẩn khi mobile */}
      <aside className="hidden min-h-0 w-[340px] shrink-0 border-r bg-white md:block">
        <FriendSiderBar/>
      </aside>

      {/* Ở giữa – luôn hiển thị */}
      <main className="flex-1 min-h-0 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}

export default HomePageFriend
