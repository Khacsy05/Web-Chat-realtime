import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Send,
  Smile,
  Paperclip,
  Phone,
  Video,
  Info,
  Search,
  CheckCheck,
  Palette,
  Monitor,
  Tablet,
  Smartphone,
  Copy,
  Check,
  Sparkles,
  ArrowLeft,
  Settings,
  MoreVertical,
  Image as ImageIcon,
  Mic,
  Moon,
  Sun,
  ShieldCheck,
  Sliders,
  Play,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

// Các bộ theme màu sắc đa dạng dựa trên MASTER.md và phong cách hiện đại
const THEME_PRESETS = [
  {
    id: "master",
    name: "Master Swiss Blue",
    tag: "Chuẩn MASTER.md",
    badge: "Official",
    description: "Phong cách Minimalism & Swiss Style với Trust Blue (#2563EB) & Orange CTA (#EA580C)",
    primary: "#2563EB",
    onPrimary: "#FFFFFF",
    secondary: "#3B82F6",
    accent: "#EA580C",
    onAccent: "#FFFFFF",
    background: "#F8FAFC",
    surface: "#FFFFFF",
    foreground: "#1E293B",
    muted: "#E9EFF8",
    mutedForeground: "#475569",
    border: "#E2E8F0",
    bubbleIncoming: "#F1F5F9",
    bubbleIncomingText: "#1E293B",
    isDark: false,
  },
  {
    id: "dark-slate",
    name: "OLED Midnight Dark",
    tag: "Dark Mode Pro",
    badge: "Hot",
    description: "Nền đen thẳm chống mỏi mắt, nhấn nhá sắc xanh dương hiện đại & cam rực rỡ",
    primary: "#3B82F6",
    onPrimary: "#FFFFFF",
    secondary: "#1D4ED8",
    accent: "#F97316",
    onAccent: "#FFFFFF",
    background: "#0B0F19",
    surface: "#131B2E",
    foreground: "#F1F5F9",
    muted: "#1E293B",
    mutedForeground: "#94A3B8",
    border: "#1E2E4A",
    bubbleIncoming: "#1E293B",
    bubbleIncomingText: "#F1F5F9",
    isDark: true,
  },
  {
    id: "cyber-purple",
    name: "Cyber Neon Violet",
    tag: "Futuristic / GenZ",
    badge: "Trendy",
    description: "Tone tím mộng mơ kết hợp hồng neon phong cách Cyberpunk & Discord",
    primary: "#7C3AED",
    onPrimary: "#FFFFFF",
    secondary: "#9333EA",
    accent: "#EC4899",
    onAccent: "#FFFFFF",
    background: "#0F172A",
    surface: "#1A153A",
    foreground: "#F8FAFC",
    muted: "#2B225A",
    mutedForeground: "#A5B4FC",
    border: "#3B2E76",
    bubbleIncoming: "#261D52",
    bubbleIncomingText: "#F8FAFC",
    isDark: true,
  },
  {
    id: "emerald-mint",
    name: "Emerald Nordic Mint",
    tag: "Fresh & Clean",
    badge: "Eco",
    description: "Tone xanh ngọc bích thiên nhiên, mang lại cảm giác bình yên, thư thái khi chat",
    primary: "#059669",
    onPrimary: "#FFFFFF",
    secondary: "#10B981",
    accent: "#F59E0B",
    onAccent: "#FFFFFF",
    background: "#F0FDF4",
    surface: "#FFFFFF",
    foreground: "#064E3B",
    muted: "#DCFCE7",
    mutedForeground: "#047857",
    border: "#BBF7D0",
    bubbleIncoming: "#E2FBE9",
    bubbleIncomingText: "#064E3B",
    isDark: false,
  },
  {
    id: "sunset-coral",
    name: "Sunset Coral & Rose",
    tag: "Warm & Lively",
    badge: "Warm",
    description: "Ấm áp năng động với gam hồng cam hoàng hôn quyến rũ và tươi mới",
    primary: "#E11D48",
    onPrimary: "#FFFFFF",
    secondary: "#F43F5E",
    accent: "#F97316",
    onAccent: "#FFFFFF",
    background: "#FFF1F2",
    surface: "#FFFFFF",
    foreground: "#4C0519",
    muted: "#FFE4E6",
    mutedForeground: "#9F1239",
    border: "#FECDD3",
    bubbleIncoming: "#FFF1F2",
    bubbleIncomingText: "#4C0519",
    isDark: false,
  },
  {
    id: "ocean-deep",
    name: "Deep Ocean Glass",
    tag: "Minimalist Marine",
    badge: "Calm",
    description: "Sắc xanh đại dương sâu thẳm mát mắt, phù hợp làm việc tập trung cao độ",
    primary: "#0284C7",
    onPrimary: "#FFFFFF",
    secondary: "#0EA5E9",
    accent: "#14B8A6",
    onAccent: "#FFFFFF",
    background: "#F0F9FF",
    surface: "#FFFFFF",
    foreground: "#0C4A6E",
    muted: "#E0F2FE",
    mutedForeground: "#0369A1",
    border: "#BAE6FD",
    bubbleIncoming: "#E0F2FE",
    bubbleIncomingText: "#0C4A6E",
    isDark: false,
  },
];

const INITIAL_CONVERSATIONS = [
  {
    id: 1,
    name: "Ngọc Mai (UI/UX Designer)",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    lastMessage: "File MASTER.md phối màu lên nhìn ưng mắt lắm anh ơi! 😍",
    time: "10:42",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "Nhóm Chat Dự Án Realtime",
    avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150",
    lastMessage: "Minh: Tối nay deploy backend lên Render nhé!",
    time: "09:30",
    unread: 0,
    online: true,
  },
  {
    id: 3,
    name: "Trần Hoàng Nam",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    lastMessage: "Đã gửi bạn 1 file tài liệu thiết kế",
    time: "Hôm qua",
    unread: 0,
    online: false,
  },
  {
    id: 4,
    name: "Thu Thảo",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    lastMessage: "Hẹn gặp vào 2h chiều nhé!",
    time: "Hôm qua",
    unread: 0,
    online: false,
  },
];

export default function ThemeShowcase() {
  const [selectedTheme, setSelectedTheme] = useState(THEME_PRESETS[0]);
  const [deviceView, setDeviceView] = useState("desktop"); // 'desktop' | 'tablet' | 'mobile'
  const [activeTab, setActiveTab] = useState("all");
  const [activeChatId, setActiveChatId] = useState(1);
  const [showInspector, setShowInspector] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [customPrimary, setCustomPrimary] = useState(THEME_PRESETS[0].primary);
  const [customAccent, setCustomAccent] = useState(THEME_PRESETS[0].accent);

  // Danh sách tin nhắn động
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "them",
      text: "Chào bạn! Đây là demo giao diện WebChat theo file MASTER.md nè ✨",
      time: "10:38",
    },
    {
      id: 2,
      sender: "them",
      text: "Bạn có thể bấm vào các mẫu màu ở thanh trên để xem giao diện đổi màu tức thì nhé!",
      time: "10:39",
    },
    {
      id: 3,
      sender: "me",
      text: "Đẹp quá! Màu Primary Trust Blue đi với nút CTA Accent cam nổi bật ghê luôn 🚀",
      time: "10:40",
      status: "read",
    },
    {
      id: 4,
      sender: "them",
      type: "audio",
      duration: "0:24",
      time: "10:41",
    },
    {
      id: 5,
      sender: "them",
      text: "File MASTER.md phối màu lên nhìn ưng mắt lắm anh ơi! 😍",
      time: "10:42",
      reactions: ["❤️", "🔥"],
    },
  ]);

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Scroll xuống đáy khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSelectTheme = (theme) => {
    setSelectedTheme(theme);
    setCustomPrimary(theme.primary);
    setCustomAccent(theme.accent);
    toast.success(`Đã áp dụng theme: ${theme.name}`);
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: "me",
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    // Giả lập bot phản hồi tự động
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "them",
          text: `Giao diện mượt mà và trực quan quá! Tone màu hiện tại (${selectedTheme.name}) rất hợp mắt. Bạn thử chuyển sang chế độ Dark Mode hoặc Cyber xem sao nhé! 👍`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          reactions: ["👍"],
        },
      ]);
    }, 1200);
  };

  const handleCopyTokens = () => {
    const cssTokens = `/* WebChat Realtime Design System Tokens - ${selectedTheme.name} */
:root {
  --color-primary: ${customPrimary};
  --color-on-primary: ${selectedTheme.onPrimary};
  --color-secondary: ${selectedTheme.secondary};
  --color-accent: ${customAccent};
  --color-on-accent: ${selectedTheme.onAccent};
  --color-background: ${selectedTheme.background};
  --color-card: ${selectedTheme.surface};
  --color-foreground: ${selectedTheme.foreground};
  --color-muted: ${selectedTheme.muted};
  --color-muted-foreground: ${selectedTheme.mutedForeground};
  --color-border: ${selectedTheme.border};
  --font-heading: 'Outfit', sans-serif;
  --font-body: 'Work Sans', sans-serif;
}`;
    navigator.clipboard.writeText(cssTokens);
    setIsCopied(true);
    toast.success("Đã sao chép bộ mã CSS Variables vào bộ nhớ tạm!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const activeContact =
    INITIAL_CONVERSATIONS.find((c) => c.id === activeChatId) || INITIAL_CONVERSATIONS[0];

  return (
    <div
      className="flex flex-col h-screen w-full font-sans overflow-hidden transition-colors duration-300 select-none"
      style={{
        backgroundColor: selectedTheme.background,
        color: selectedTheme.foreground,
        fontFamily: "'Work Sans', 'Outfit', sans-serif",
      }}
    >
      {/* ================= TOP CONTROL BAR ================= */}
      <header
        className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b z-20 backdrop-blur-md shadow-xs transition-colors"
        style={{
          backgroundColor: selectedTheme.surface + "E6",
          borderColor: selectedTheme.border,
        }}
      >
        {/* Logo & Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition hover:opacity-80 cursor-pointer"
            style={{
              borderColor: selectedTheme.border,
              backgroundColor: selectedTheme.surface,
              color: selectedTheme.foreground,
            }}
          >
            <ArrowLeft size={14} />
            Quay lại
          </button>

          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
              style={{ backgroundColor: customPrimary }}
            >
              <Palette size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
                  Design System Studio
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider"
                  style={{ backgroundColor: customAccent }}
                >
                  MASTER.MD
                </span>
              </div>
              <p className="text-[11px] opacity-70">Trình diễn đa màu sắc giao diện WebChat</p>
            </div>
          </div>
        </div>

        {/* Theme Presets Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
          {THEME_PRESETS.map((t) => {
            const isActive = selectedTheme.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTheme(t)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${
                  isActive ? "ring-2 scale-102 shadow-xs" : "hover:opacity-80"
                }`}
                style={{
                  backgroundColor: isActive ? t.surface : t.surface + "80",
                  borderColor: isActive ? t.primary : t.border,
                  color: t.foreground,
                  ringColor: t.primary,
                }}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border shadow-2xs"
                  style={{
                    backgroundColor: t.primary,
                    borderColor: t.accent,
                    borderWidth: "2px",
                  }}
                />
                <span className="font-semibold">{t.name}</span>
                {t.badge && (
                  <span
                    className="text-[9px] px-1.5 py-0.2 rounded-md font-bold"
                    style={{
                      backgroundColor: isActive ? t.accent : t.muted,
                      color: isActive ? "#FFF" : t.mutedForeground,
                    }}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Actions & Device Views */}
        <div className="flex items-center gap-2">
          {/* Custom Color Pickers */}
          <div
            className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl border text-xs"
            style={{ backgroundColor: selectedTheme.surface, borderColor: selectedTheme.border }}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium opacity-75">Primary:</span>
              <input
                type="color"
                value={customPrimary}
                onChange={(e) => setCustomPrimary(e.target.value)}
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                title="Đổi màu Primary"
              />
            </div>
            <div className="h-3 w-px bg-gray-300 opacity-50" />
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium opacity-75">CTA Accent:</span>
              <input
                type="color"
                value={customAccent}
                onChange={(e) => setCustomAccent(e.target.value)}
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                title="Đổi màu CTA Accent"
              />
            </div>
          </div>

          {/* Device Mockup Toggle */}
          <div
            className="hidden md:flex items-center p-1 rounded-xl border gap-0.5"
            style={{ backgroundColor: selectedTheme.surface, borderColor: selectedTheme.border }}
          >
            {[
              { id: "desktop", icon: Monitor, title: "Màn hình rộng" },
              { id: "tablet", icon: Tablet, title: "Tablet" },
              { id: "mobile", icon: Smartphone, title: "Mobile" },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setDeviceView(d.id)}
                title={d.title}
                className="p-1.5 rounded-lg transition cursor-pointer"
                style={{
                  backgroundColor: deviceView === d.id ? customPrimary : "transparent",
                  color: deviceView === d.id ? "#FFFFFF" : selectedTheme.foreground,
                }}
              >
                <d.icon size={15} />
              </button>
            ))}
          </div>

          {/* Export CSS Button */}
          <button
            onClick={handleCopyTokens}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white shadow-sm transition hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: customAccent }}
          >
            {isCopied ? <Check size={14} /> : <Copy size={14} />}
            <span className="hidden sm:inline">{isCopied ? "Đã chép CSS!" : "Copy Token"}</span>
          </button>
        </div>
      </header>

      {/* ================= MAIN WORKSPACE ================= */}
      <main className="flex-1 flex items-center justify-center overflow-hidden p-0 sm:p-3 relative">
        {/* Khung giả lập giao diện tùy chỉnh theo Device View */}
        <div
          className={`flex h-full w-full overflow-hidden transition-all duration-300 rounded-none sm:rounded-2xl border shadow-xl ${
            deviceView === "mobile"
              ? "max-w-[420px] max-h-[840px] my-auto"
              : deviceView === "tablet"
              ? "max-w-[768px] max-h-[900px] my-auto"
              : "max-w-[1600px]"
          }`}
          style={{
            backgroundColor: selectedTheme.surface,
            borderColor: selectedTheme.border,
            boxShadow: `0 20px 40px -15px ${customPrimary}20`,
          }}
        >
          {/* ================= 1. LEFT SIDEBAR (CHAT LIST) ================= */}
          <aside
            className={`w-full md:w-[320px] lg:w-[360px] flex-shrink-0 flex flex-col border-r transition-colors ${
              deviceView === "mobile" && activeChatId ? "hidden md:flex" : "flex"
            }`}
            style={{
              backgroundColor: selectedTheme.surface,
              borderColor: selectedTheme.border,
            }}
          >
            {/* Sidebar Header */}
            <div
              className="p-4 border-b flex items-center justify-between"
              style={{ borderColor: selectedTheme.border }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                    alt="My Avatar"
                    className="w-10 h-10 rounded-full object-cover ring-2"
                    style={{ ringColor: customPrimary }}
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div>
                  <h2
                    className="font-bold text-sm leading-tight"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    Khắc Sỹ (Bạn)
                  </h2>
                  <span className="text-[11px] text-emerald-500 font-medium">Đang hoạt động</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  className="p-2 rounded-xl transition hover:opacity-80 cursor-pointer"
                  style={{ backgroundColor: selectedTheme.muted }}
                >
                  <Settings size={16} />
                </button>
              </div>
            </div>

            {/* Search Input (Tuân thủ Input Spec trong MASTER.md) */}
            <div className="px-4 py-3">
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all"
                style={{
                  backgroundColor: selectedTheme.isDark ? selectedTheme.muted : "#F8FAFC",
                  borderColor: selectedTheme.border,
                }}
              >
                <Search size={16} className="opacity-50" />
                <input
                  type="text"
                  placeholder="Tìm kiếm cuộc trò chuyện..."
                  className="w-full bg-transparent text-xs focus:outline-none placeholder:opacity-50"
                  style={{ color: selectedTheme.foreground }}
                />
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1 px-4 pb-2 border-b" style={{ borderColor: selectedTheme.border }}>
              {[
                { id: "all", label: "Tất cả" },
                { id: "unread", label: "Chưa đọc" },
                { id: "groups", label: "Nhóm" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                  style={{
                    backgroundColor: activeTab === tab.id ? customPrimary : "transparent",
                    color: activeTab === tab.id ? "#FFFFFF" : selectedTheme.mutedForeground,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: selectedTheme.border + "40" }}>
              {INITIAL_CONVERSATIONS.map((c) => {
                const isSelected = c.id === activeChatId;
                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveChatId(c.id)}
                    className="flex items-center gap-3 p-3.5 transition-all cursor-pointer hover:opacity-90"
                    style={{
                      backgroundColor: isSelected
                        ? selectedTheme.isDark
                          ? customPrimary + "20"
                          : selectedTheme.muted
                        : "transparent",
                      borderLeft: isSelected ? `4px solid ${customPrimary}` : "4px solid transparent",
                    }}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className="w-11 h-11 rounded-full object-cover"
                      />
                      {c.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-xs truncate">{c.name}</h3>
                        <span className="text-[10px] opacity-60 font-medium">{c.time}</span>
                      </div>
                      <p className="text-[11px] truncate opacity-70">{c.lastMessage}</p>
                    </div>

                    {c.unread > 0 && (
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: customAccent }}
                      >
                        {c.unread}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>

          {/* ================= 2. CHAT PANEL (TRUNG TÂM) ================= */}
          <section
            className="flex-1 flex flex-col min-w-0 h-full overflow-hidden"
            style={{ backgroundColor: selectedTheme.background }}
          >
            {/* Header Chat */}
            <div
              className="px-4 py-3 border-b flex items-center justify-between z-10 shadow-2xs"
              style={{
                backgroundColor: selectedTheme.surface,
                borderColor: selectedTheme.border,
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                {deviceView === "mobile" && (
                  <button
                    onClick={() => setActiveChatId(null)}
                    className="md:hidden p-1.5 rounded-lg mr-1 cursor-pointer"
                    style={{ backgroundColor: selectedTheme.muted }}
                  >
                    <ArrowLeft size={16} />
                  </button>
                )}

                <div className="relative flex-shrink-0">
                  <img
                    src={activeContact.avatar}
                    alt={activeContact.name}
                    className="w-10 h-10 rounded-full object-cover ring-2"
                    style={{ ringColor: customPrimary }}
                  />
                  {activeContact.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  )}
                </div>

                <div className="min-w-0">
                  <h3
                    className="font-bold text-sm truncate"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    {activeContact.name}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] text-emerald-500 font-medium">
                      Đang trực tuyến
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons (Đúng phong cách Button trong MASTER.md) */}
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  className="p-2 sm:px-3 sm:py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition hover:opacity-80 cursor-pointer"
                  style={{
                    borderColor: selectedTheme.border,
                    backgroundColor: selectedTheme.surface,
                    color: selectedTheme.foreground,
                  }}
                  title="Gọi thoại"
                >
                  <Phone size={15} />
                  <span className="hidden sm:inline">Gọi</span>
                </button>

                <button
                  className="p-2 sm:px-3 sm:py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition hover:opacity-80 cursor-pointer"
                  style={{
                    borderColor: selectedTheme.border,
                    backgroundColor: selectedTheme.surface,
                    color: selectedTheme.foreground,
                  }}
                  title="Gọi video"
                >
                  <Video size={15} />
                  <span className="hidden sm:inline">Video</span>
                </button>

                <button
                  onClick={() => setShowInspector(!showInspector)}
                  className="p-2 rounded-xl transition hover:opacity-80 cursor-pointer"
                  style={{
                    backgroundColor: showInspector ? customPrimary : selectedTheme.muted,
                    color: showInspector ? "#FFFFFF" : selectedTheme.foreground,
                  }}
                  title="Thông tin chi tiết"
                >
                  <Info size={16} />
                </button>
              </div>
            </div>

            {/* Message Area */}
            <div
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
              style={{
                backgroundImage: selectedTheme.isDark
                  ? `radial-gradient(${customPrimary}15 1px, transparent 1px)`
                  : `radial-gradient(${customPrimary}10 1px, transparent 1px)`,
                backgroundSize: "20px 20px",
              }}
            >
              {/* Divider Ngày */}
              <div className="flex items-center justify-center my-2">
                <span
                  className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border shadow-2xs"
                  style={{
                    backgroundColor: selectedTheme.surface,
                    borderColor: selectedTheme.border,
                    color: selectedTheme.mutedForeground,
                  }}
                >
                  Hôm nay
                </span>
              </div>

              {/* Messages list */}
              {messages.map((m) => {
                const isMe = m.sender === "me";

                return (
                  <div
                    key={m.id}
                    className={`flex items-end gap-2.5 ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    {!isMe && (
                      <img
                        src={activeContact.avatar}
                        alt="avatar"
                        className="w-7 h-7 rounded-full object-cover mb-1 flex-shrink-0"
                      />
                    )}

                    <div className={`max-w-[78%] sm:max-w-[65%] space-y-1 ${isMe ? "items-end" : "items-start"}`}>
                      {/* Audio message mockup */}
                      {m.type === "audio" ? (
                        <div
                          className="p-3.5 rounded-2xl border shadow-sm flex items-center gap-3"
                          style={{
                            backgroundColor: selectedTheme.surface,
                            borderColor: selectedTheme.border,
                          }}
                        >
                          <button
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0 transition hover:scale-105 cursor-pointer"
                            style={{ backgroundColor: customPrimary }}
                          >
                            <Play size={16} fill="white" className="ml-0.5" />
                          </button>
                          <div className="flex-1 min-w-[140px]">
                            <div className="flex items-center gap-1 h-5">
                              {[35, 60, 40, 90, 70, 50, 80, 40, 60, 95, 30, 75, 45, 85].map((h, i) => (
                                <span
                                  key={i}
                                  className="w-1 rounded-full transition-all"
                                  style={{
                                    height: `${h}%`,
                                    backgroundColor: i < 6 ? customPrimary : selectedTheme.border,
                                  }}
                                />
                              ))}
                            </div>
                            <div className="flex justify-between text-[10px] opacity-60 mt-1">
                              <span>0:08</span>
                              <span>{m.duration}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Text message bubble */
                        <div
                          className={`relative p-3.5 rounded-2xl text-xs sm:text-sm font-medium shadow-sm transition-all ${
                            isMe ? "rounded-br-xs" : "rounded-bl-xs"
                          }`}
                          style={{
                            backgroundColor: isMe ? customPrimary : selectedTheme.bubbleIncoming,
                            color: isMe ? selectedTheme.onPrimary : selectedTheme.bubbleIncomingText,
                            boxShadow: isMe
                              ? `0 4px 12px ${customPrimary}35`
                              : `0 2px 6px rgba(0,0,0,0.04)`,
                          }}
                        >
                          <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>

                          {/* Footer của bubble: Time & Status */}
                          <div
                            className={`flex items-center gap-1 text-[10px] mt-1.5 opacity-80 ${
                              isMe ? "justify-end text-white/90" : "justify-end"
                            }`}
                          >
                            <span>{m.time}</span>
                            {isMe && <CheckCheck size={13} className="text-white" />}
                          </div>

                          {/* Reactions */}
                          {m.reactions && (
                            <div
                              className="absolute -bottom-2 right-2 flex items-center gap-0.5 px-2 py-0.5 rounded-full border text-[11px] shadow-xs"
                              style={{
                                backgroundColor: selectedTheme.surface,
                                borderColor: selectedTheme.border,
                              }}
                            >
                              {m.reactions.join(" ")}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-2">
                  <img
                    src={activeContact.avatar}
                    alt="avatar"
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div
                    className="px-3.5 py-2.5 rounded-2xl rounded-bl-xs border flex items-center gap-1.5 text-xs shadow-xs"
                    style={{
                      backgroundColor: selectedTheme.bubbleIncoming,
                      borderColor: selectedTheme.border,
                      color: selectedTheme.foreground,
                    }}
                  >
                    <span className="text-[11px] opacity-75">{activeContact.name.split(" ")[0]} đang soạn tin</span>
                    <div className="flex items-center gap-1 ml-1">
                      <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: customPrimary }} />
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.2s]"
                        style={{ backgroundColor: customPrimary }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.4s]"
                        style={{ backgroundColor: customPrimary }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ================= CHAT INPUT BOX ================= */}
            <div
              className="p-3 sm:p-4 border-t z-10"
              style={{
                backgroundColor: selectedTheme.surface,
                borderColor: selectedTheme.border,
              }}
            >
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                {/* Media Actions */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="p-2.5 rounded-xl border transition hover:opacity-80 cursor-pointer"
                    style={{
                      backgroundColor: selectedTheme.isDark ? selectedTheme.muted : "#F8FAFC",
                      borderColor: selectedTheme.border,
                    }}
                    title="Đính kèm tệp"
                  >
                    <Paperclip size={16} />
                  </button>

                  <button
                    type="button"
                    className="hidden sm:flex p-2.5 rounded-xl border transition hover:opacity-80 cursor-pointer"
                    style={{
                      backgroundColor: selectedTheme.isDark ? selectedTheme.muted : "#F8FAFC",
                      borderColor: selectedTheme.border,
                    }}
                    title="Gửi ảnh"
                  >
                    <ImageIcon size={16} />
                  </button>
                </div>

                {/* Input Text Field (Chuẩn MASTER.md) */}
                <div
                  className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl border transition-all focus-within:ring-2"
                  style={{
                    backgroundColor: selectedTheme.isDark ? selectedTheme.muted : "#F8FAFC",
                    borderColor: selectedTheme.border,
                    ringColor: customPrimary,
                  }}
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Nhập tin nhắn để thử nghiệm ngay..."
                    className="w-full bg-transparent text-xs sm:text-sm focus:outline-none placeholder:opacity-50"
                    style={{ color: selectedTheme.foreground }}
                  />

                  <button
                    type="button"
                    className="opacity-60 hover:opacity-100 transition cursor-pointer"
                    title="Chọn emoji"
                  >
                    <Smile size={18} />
                  </button>
                </div>

                {/* Primary CTA Send Button (Sử dụng Accent CTA từ MASTER.md) */}
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="h-11 px-4 sm:px-5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: customAccent,
                    boxShadow: `0 4px 14px ${customAccent}40`,
                  }}
                >
                  <Send size={15} />
                  <span className="hidden sm:inline text-xs font-bold">Gửi</span>
                </button>
              </form>
            </div>
          </section>

          {/* ================= 3. RIGHT INSPECTOR / DESIGN SYSTEM PANEL ================= */}
          {showInspector && (
            <aside
              className="hidden xl:flex w-[320px] flex-shrink-0 flex-col border-l overflow-y-auto p-4 space-y-5"
              style={{
                backgroundColor: selectedTheme.surface,
                borderColor: selectedTheme.border,
              }}
            >
              {/* Profile Card Info */}
              <div
                className="p-4 rounded-2xl border text-center relative overflow-hidden"
                style={{
                  backgroundColor: selectedTheme.muted + "40",
                  borderColor: selectedTheme.border,
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-16 opacity-30"
                  style={{ backgroundColor: customPrimary }}
                />
                <img
                  src={activeContact.avatar}
                  alt={activeContact.name}
                  className="w-16 h-16 rounded-full mx-auto relative z-10 border-2 object-cover ring-2"
                  style={{ borderColor: "#FFF", ringColor: customPrimary }}
                />
                <h4 className="font-bold text-sm mt-2">{activeContact.name}</h4>
                <p className="text-[11px] opacity-70">UI/UX & Frontend Specialist</p>

                <div className="flex items-center justify-center gap-2 mt-3">
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: customPrimary }}
                  >
                    Đang trò chuyện
                  </span>
                </div>
              </div>

              {/* Design Token Inspector Box */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} style={{ color: customAccent }} />
                    Tokens MASTER.md
                  </h4>
                  <button
                    onClick={handleCopyTokens}
                    className="text-[11px] font-semibold hover:underline cursor-pointer"
                    style={{ color: customPrimary }}
                  >
                    Sao chép
                  </button>
                </div>

                <div
                  className="p-3 rounded-xl border text-xs space-y-2.5"
                  style={{
                    backgroundColor: selectedTheme.isDark ? "#0A0D14" : "#F8FAFC",
                    borderColor: selectedTheme.border,
                    fontFamily: "monospace",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="opacity-75">--color-primary:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-md border" style={{ backgroundColor: customPrimary }} />
                      <span className="font-semibold">{customPrimary}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="opacity-75">--color-accent (CTA):</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-md border" style={{ backgroundColor: customAccent }} />
                      <span className="font-semibold">{customAccent}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="opacity-75">--color-background:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-md border" style={{ backgroundColor: selectedTheme.background }} />
                      <span className="font-semibold">{selectedTheme.background}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="opacity-75">--color-card:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-md border" style={{ backgroundColor: selectedTheme.surface }} />
                      <span className="font-semibold">{selectedTheme.surface}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="opacity-75">--font-heading:</span>
                    <span className="font-semibold">Outfit</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="opacity-75">--font-body:</span>
                    <span className="font-semibold">Work Sans</span>
                  </div>
                </div>
              </div>

              {/* Spec Checklist */}
              <div
                className="p-3.5 rounded-xl border text-xs space-y-2"
                style={{
                  backgroundColor: selectedTheme.muted + "30",
                  borderColor: selectedTheme.border,
                }}
              >
                <div className="flex items-center gap-2 font-semibold">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span>Quy tắc chuẩn Swiss Style:</span>
                </div>
                <ul className="space-y-1.5 text-[11px] opacity-80 list-disc list-inside">
                  <li>Nút CTA dùng màu Accent cam đối nghịch cao</li>
                  <li>Font chữ cân đối, không dùng emoji thay icon</li>
                  <li>Bo góc tiêu chuẩn 12px - 16px</li>
                  <li>Hiệu ứng hover chuyển động mượt 200ms</li>
                </ul>
              </div>

              {/* Reset to Default Button */}
              <button
                onClick={() => handleSelectTheme(THEME_PRESETS[0])}
                className="w-full py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition hover:opacity-80 cursor-pointer"
                style={{
                  borderColor: selectedTheme.border,
                  backgroundColor: selectedTheme.surface,
                }}
              >
                <RotateCcw size={13} />
                Khôi phục Master mặc định
              </button>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
