import { Input } from '@/components/ui/input';
import message from '@/service/message';
import useAuthStore from '@/stores/useAuthStore';
import { ArrowLeft, PanelLeft, Search, Send, ThumbsUp } from 'lucide-react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import socket from '@/lib/socket';

const messSchema = yup.object().shape({
  content: yup.string().required("vui long nhap noi dung"),
});

const EMPTY_FORM = {
  content: "",
};

const MD_PX = 768;

const ConversationView = ({
  selectedConversation,
  onMessageEvent,
  onOpenRighPage,
  isOpenRighPage,
  onMobileBack,
}) => {
  const currentUser = useAuthStore((state) => state.user);
  const [mess, setMess] = useState([]);
  const chatBodyRef = useRef(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [loadedConversationId, setLoadedConversationId] = useState(null);
  const [isNarrowScreen, setIsNarrowScreen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < MD_PX
  );
  const LIKE_EMOJI = "👍";

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MD_PX - 1}px)`);
    const handler = () => setIsNarrowScreen(mq.matches);
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const showMobileBack = Boolean(onMobileBack && isNarrowScreen && selectedConversation);

  useEffect(() => {
    if (!currentUser?._id) return;
    socket.emit("join", String(currentUser._id));
  }, [currentUser?._id]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(messSchema),
    mode: "onSubmit",
    defaultValues: EMPTY_FORM
  });

  const content = watch("content");

  useEffect(() => {
    let ignore = false;
    const conversationId = selectedConversation?._id;

    const fetchMessage = async () => {
      if (!conversationId) {
        setMess([]);
        setLoadedConversationId(null);
        setIsLoadingMessages(false);
        return;
      }

      // Clear ngay để UI chuyển tức thì khi bấm đổi người chat
      setMess([]);
      setLoadedConversationId(null);
      setIsLoadingMessages(true);

      try {
        const response = await message.getMessage(conversationId);
        if (ignore) return;
        setMess(response.data);
        setLoadedConversationId(String(conversationId));
      } catch (error) {
        if (ignore) return;
        console.error('Error fetching message:', error);
        setLoadedConversationId(String(conversationId));
      } finally {
        if (ignore) return;
        setIsLoadingMessages(false);
      }
    };

    fetchMessage();
    return () => {
      ignore = true;
    };
  }, [selectedConversation?._id]);

  useEffect(() => {
    if (!selectedConversation?._id) return;

    const onReceive = (payload) => {
      onMessageEvent?.({
        conversationId: String(payload.conversationId),
        senderId: payload.form,
        content: payload.text,
        createdAt: new Date().toISOString(),
      })
      if (String(payload.conversationId) !== String(selectedConversation._id)) return;

      setMess((prev) => {
        if (prev.some((m) => String(m.messageId) === String(payload.messageId))) return prev;
        return [...prev, {
          messageId: payload.messageId,
          senderId: payload.from,
          name: payload.name ?? "Nguoi dung",
          content: payload.text
        }];
      });
    };

    socket.on("receive-message", onReceive);
    return () => socket.off("receive-message", onReceive);
    

  }, [selectedConversation?._id]);

  useLayoutEffect(() => {
    if(isLoadingMessages) return;
    const el = chatBodyRef.current;
    const id = selectedConversation?._id;
    if (!el || !id) return;
    if (String(loadedConversationId) !== String(id)) return;

    el.scrollTop = el.scrollHeight;
  }, [selectedConversation?._id, mess.length, isLoadingMessages, loadedConversationId]);

  if (!selectedConversation?._id) {
    return (
      <div className="flex h-full items-center justify-center bg-white text-sm text-muted-foreground">
        Chon mot cuoc tro chuyen
      </div>
    );
  }

  const otherMember =
    selectedConversation?.members?.find(
      (member) => String(member.userId) !== String(currentUser?._id)
    ) || selectedConversation?.members?.[0];

  const thisMember =
    selectedConversation?.members?.find(
      (member) => String(member.userId) === String(currentUser?._id)
    ); 
  const displayName = otherMember?.fullname || 'Nguoi dung';
  const userName = thisMember?.fullname || 'Nguoi dung';
  const conversationId = selectedConversation._id;

  const handleSendMess = async (data) => {
    try {
      const receiverId = otherMember?.userId;
      const res = await message.sendMessage({
        conversationId,
        content: data.content
      });

      reset();

      setMess((prev) => [
        ...prev,
        {
          messageId: res.data._id,
          senderId: currentUser._id,
          name: userName|| "Nguoi dung",
          content: data.content
        }
      ]);

      onMessageEvent?.({
        conversationId: String(selectedConversation._id),
        senderId: currentUser._id,
        content: data.content,
        createdAt: new Date().toISOString(),
      })

      socket.emit("send-message", {
        from: String(currentUser._id),
        to: String(receiverId),
        text: data.content,
        conversationId: String(conversationId),
        messageId: String(res.data._id),
        name: userName||  "Nguoi dung"
      });

    } catch (error) {
      toast.error("Gui tin nhan that bai");
    }
  };

  


  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b bg-white px-3 py-3">
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            {showMobileBack && (
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#1f2328] hover:bg-[#f1f3f5]"
                onClick={onMobileBack}
                aria-label="Quay lai"
              >
                <ArrowLeft size={22} />
              </button>
            )}
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#dbe4ff] text-[18px] font-semibold text-[#3b5bdb]">
              <img
                src={`http://localhost:5000${otherMember?.avatar || "/uploads/default-avatar.png"}`}
                alt={displayName}
                className="size-12 rounded-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-medium text-[#1f2328]">
                {displayName}
              </div>
              <div className="truncate text-[13px] text-muted-foreground">
                Dang hoat dong
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center shrink-0">
              <Search />
            </div>
            <button 
              className="cursor-pointer flex items-center justify-center shrink-0"
              onClick={() => onOpenRighPage(!isOpenRighPage)}
            >
              <PanelLeft />
            </button>
          </div>
        </div>
      </div>

      <div ref={chatBodyRef} className="flex-1 min-h-0 overflow-y-auto p-4">
        {isLoadingMessages && (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Dang tai tin nhan...
          </div>
        )}

        {!isLoadingMessages && mess.map((item, index) => {
          const isMe = String(item.senderId) === String(currentUser?._id);

          return (
            <div key={item.messageId || index} className={`mb-3 flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              {!isMe && (
                <div className="mb-1 text-xs text-muted-foreground">
                  {item.name}
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm break-words whitespace-pre-wrap${
                  isMe
                    ? 'rounded-tr-none bg-[#3b5bdb] text-white'
                    : 'rounded-tl-none bg-[#f1f3f5] text-[#1f2328]'
                }`}
              >
                {item.content}
              </div>
            </div>
          );
        })}
      </div>

      <div className="shrink-0 border-t bg-white p-3">
        <form onSubmit={handleSubmit(handleSendMess)}>
          <div className="flex items-center gap-2">
            <Input
              className="h-10 flex-1 border-none bg-gray-50 focus-visible:ring-1 focus-visible:ring-[#3b5bdb]"
              placeholder="Nhap tin nhan..."
              {...register("content")}
            />
            {content?.trim() ? (
              <button
                type="submit"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf2ff] text-[#3b5bdb]"
              >
                <Send size={20} strokeWidth={2.5} fill="#4f6fef" className='text-blue-500' />
              </button>
            ) : (
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf2ff] text-[#3b5bdb]"
                onClick={() => handleSendMess({ content: LIKE_EMOJI })}

              >
                <ThumbsUp className='text-yellow-500' fill="#d2dd10" size={20} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConversationView;
