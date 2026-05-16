import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, MoreHorizontal, Search, UserPlus, UsersRound } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import message from '@/service/message';
import UserCardChat from './UserCardChat';
import socket from '@/lib/socket';


const ListSeacrh = () => {
  return (
    <div>

    </div>
  )
}

const ChatList = ({onSelectConversation, lastMessageEvent }) => {
  const [isSearch,setIsSearch] = useState(false);
  const [tab, setTab] = useState("all");
  const [activeAction, setActiveAction] = useState(null);
  const [conversation,setConversation] = useState([])

  const fetchConverSation = async () => {
    try {
      const response = await message.getConversation();
      setConversation(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching conversation:", error);
    }
  }

  useEffect(()=> {
    fetchConverSation();
    
    const handleReceive = () => {
      fetchConverSation();
    };

    socket.on("receive-message", handleReceive);
    return () => socket.off("receive-message", handleReceive);
  },[])

   useEffect(() => {
      if (!lastMessageEvent?.conversationId) return;
      setConversation(prev => {
        const next = [...prev];
        const i = next.findIndex(c => String(c._id) === String(lastMessageEvent.conversationId));
        if (i === -1) return prev;

        const updated = { 
          ...next[i], 
          lastMessage: lastMessageEvent.content,
          lastSenderId: lastMessageEvent.senderId, 
          updatedAt: new Date().toISOString() 
        };
        next.splice(i, 1);
        next.unshift(updated);
        return next;
      });

    }, [lastMessageEvent]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
    
      {/* SEARCH */}
      <div className="shrink-0 px-3 pt-3 border-b">
        <div className='flex gap-1'>
          <div className='relative'>
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input className=" h-9 w-[220px] text-sm pl-7  bg-[#ededed]" 
              placeholder="Search..."
              onFocus={() => setIsSearch(true)}
            />
          </div>
          {isSearch ? (
            <Button className="cursor-pointer w-[70px] bg-white text-black hover:bg-[#ededed] "
              onClick={() => setIsSearch(false)}
            >
              Đóng 
            </Button>
          ): (
            <div className = "flex ">
              <Button className="bg-white text-black hover:bg-[#ededed] ">
                <UserPlus size={20}/>
              </Button>
              <Button className="bg-white text-black hover:bg-[#ededed] cursor-pointer ">
                <UsersRound size={20}/>
              </Button>
            </div>
          )}
        </div>

          
        <div className="flex items-end justify-between text-[13px] pt-4">

          {/* LEFT */}
          <div className="flex items-center gap-3">
            <span 
              onClick={() => setTab("all")}
              className={`relative cursor-pointer pb-3 transition
                ${tab === "all"
                  ? "text-[#234ae8] after:absolute after:left-0 after:right-0 after:bottom-[-1px] after:h-0.5 after:rounded-full after:bg-[#234ae8]"
                  : "text-muted-foreground hover:text-[#234ae8]"
                }`}
            >Tất cả</span>
            <span 
              onClick={() => setTab("unread")}
              className={`relative cursor-pointer pb-3 transition
                ${tab === "unread"
                  ? "text-[#234ae8] after:absolute after:left-0 after:right-0 after:bottom-[-1px] after:h-0.5 after:rounded-full after:bg-[#234ae8]"
                  : "text-muted-foreground hover:text-[#234ae8]"
                }`}
            >Chưa đọc</span>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3 pb-2">
           <span
              onClick={() =>
                setActiveAction(activeAction === "filter" ? null : "filter")
              }
              className={`flex items-center gap-1 rounded-[20px] cursor-pointer transition
                ${
                  activeAction === "filter"
                    ? "bg-[#E8EDFF] text-[#3B5BDB]"
                    : "hover:bg-muted"
                }
              `}
            >
              Phân loại
              <ChevronDown size={14} />
            </span>
            <span
              onClick={() =>
                setActiveAction(activeAction === "more" ? null : "more")
              }
              className={`p-1 rounded-[20px] cursor-pointer transition
                ${
                  activeAction === "more"
                    ? "bg-[#E8EDFF] text-[#3B5BDB]"
                    : "hover:bg-muted"
                }
              `}
            >
              <MoreHorizontal size={18} />
            </span>
          </div>
        </div>
      </div>
      {/* LIST */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <UserCardChat 
          userCardChat = {conversation} 
          onSelectConversation={onSelectConversation}
          lastMessageEvent = {lastMessageEvent}
        />
      </div>
    </div>
  );
}

export default ChatList
