import React, { useEffect, useState } from 'react'
import FriendSiderBar from './FriendSiderBar'
import { Outlet, useLocation } from 'react-router-dom'

const LG_PX = 1024;

const HomePageFriend = () => {
  const location = useLocation();
  const [isNarrowScreen, setIsNarrowScreen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < LG_PX
  );
  const [mobileShowOutlet, setMobileShowOutlet] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${LG_PX - 1}px)`);
    const handler = () => setIsNarrowScreen(mq.matches);
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const openFriendContent = () => {
    if (isNarrowScreen) setMobileShowOutlet(true);
  };

  const openFriendSidebar = () => {
    if (isNarrowScreen) setMobileShowOutlet(false);
  };

  useEffect(() => {
    if (!isNarrowScreen) {
      setMobileShowOutlet(true);
      return;
    }

    if (location.state?.showFriendContent) {
      setMobileShowOutlet(true);
      return;
    }

    if (location.pathname.includes('/friend/chat/')) {
      setMobileShowOutlet(true);
      return;
    }

    if (location.pathname.includes('/friend/allFriend')) {
      setMobileShowOutlet(true);
      return;
    }
    if (location.pathname.includes('/friend/addFriend')) {
      setMobileShowOutlet(true);
      return;
    }
    if (location.pathname.includes('/friend/pendingRequest')) {
      setMobileShowOutlet(true);
      return;
    }

    setMobileShowOutlet(false);
  }, [isNarrowScreen, location.pathname, location.state?.showFriendContent]);

  const outletContext = {
    openFriendContent,
    openFriendSidebar,
    isNarrowScreen,
  };

  return (
    <div className="relative flex h-full min-h-0 w-full overflow-hidden">
      {/* >= lg: sidebar + outlet cạnh nhau */}
      <aside className="hidden min-h-0 w-[340px] shrink-0 border-r bg-white lg:flex lg:flex-col">
        <FriendSiderBar onOpenContent={openFriendContent} />
      </aside>

      <main className="hidden min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:flex">
        <Outlet context={outletContext} />
      </main>

      {/* < lg: chỉ 1 panel full width sử dụng CSS để ẩn/hiện thay vì unmount để giữ cache */}
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden lg:hidden">
        <div className={`h-full w-full min-w-0 flex-col bg-white ${!mobileShowOutlet ? 'flex' : 'hidden'}`}>
          <FriendSiderBar onOpenContent={openFriendContent} />
        </div>
        <main className={`h-full w-full min-w-0 flex-1 flex-col overflow-hidden ${mobileShowOutlet ? 'flex' : 'hidden'}`}>
          <Outlet context={outletContext} />
        </main>
      </div>
    </div>
  )
}

export default HomePageFriend
