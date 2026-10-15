import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Lock,
  User,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap,
  Users,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  Send,
  Heart,
  Smile,
  Laptop,
} from "lucide-react";
import { toast } from "sonner";

export default function AuthShowcase() {
  const navigate = useNavigate();

  // State điều khiển
  const [activeStyle, setActiveStyle] = useState("split"); // "split" | "aurora" | "clean"
  const [activeForm, setActiveForm] = useState("login"); // "login" | "register" | "forgot"

  // Form input states để người dùng gõ thử tương tác thật
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleTestSubmit = (e) => {
    e.preventDefault();
    if (activeForm === "login") {
      toast.success("Thử nghiệm đăng nhập thành công! 🎉 (Đây là bản xem trước tương tác)");
    } else if (activeForm === "register") {
      toast.success("Thử nghiệm đăng ký thành công! 🎉");
    } else {
      if (!otpSent) {
        setOtpSent(true);
        toast.success("Mã OTP thử nghiệm đã gửi: 123456");
      } else {
        toast.success("Xác thực OTP thành công!");
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col font-sans bg-[#0c1017] text-slate-100 select-none">
      {/* ================= HEADER THANH ĐIỀU KHIỂN ================= */}
      <nav className="h-14 border-b border-white/10 bg-[#0f141f]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 transition border border-white/10 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Về trang Login hiện tại</span>
          </button>

          <div className="h-4 w-px bg-white/15" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              So sánh Giao diện Auth
            </span>
            <span className="text-xs text-slate-400 hidden md:inline">
              (Khắc phục cảm giác bị trống trải)
            </span>
          </div>
        </div>

        {/* Bộ chọn Style */}
        <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 gap-1">
          <button
            onClick={() => setActiveStyle("split")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeStyle === "split"
                ? "bg-blue-600 text-white shadow-sm font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>Option 1: Split-Screen Hero</span>
            <span className="text-[10px] bg-blue-500/40 text-blue-100 px-1.5 py-0.2 rounded-full hidden sm:inline">
              Khuyên dùng
            </span>
          </button>

          <button
            onClick={() => setActiveStyle("aurora")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              activeStyle === "aurora"
                ? "bg-purple-600 text-white shadow-sm font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>Option 2: Aurora Glass</span>
          </button>

          <button
            onClick={() => setActiveStyle("clean")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              activeStyle === "clean"
                ? "bg-slate-700 text-white shadow-sm font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>Option 3: Modern Swiss Light</span>
          </button>
        </div>
      </nav>

      {/* ================= KHÔNG GIAN DEMO CHÍNH ================= */}
      <div className="flex-1 flex flex-col relative overflow-y-auto">
        {/* ================= STYLE 1: SPLIT SCREEN (KHUYÊN DÙNG) ================= */}
        {activeStyle === "split" && (
          <div className="flex-1 min-h-[calc(100vh-3.5rem)] flex flex-col lg:flex-row bg-[#0b0f19] text-slate-100">
            {/* Cột trái: Form thao tác */}
            <div className="w-full lg:w-[48%] xl:w-[45%] flex flex-col justify-center px-6 sm:px-12 py-10 z-10">
              <div className="max-w-[430px] w-full mx-auto space-y-6">
                {/* Logo & Brand Title */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-white">ChatWave</h1>
                    <p className="text-xs text-slate-400">Kết nối tức thì, trò chuyện không giới hạn</p>
                  </div>
                </div>

                {/* Tab chuyển đổi Form Đăng nhập / Đăng ký / Quên MK */}
                <div className="flex border-b border-slate-800 pb-1 gap-6 text-sm font-medium">
                  <button
                    onClick={() => setActiveForm("login")}
                    className={`pb-2.5 transition relative cursor-pointer ${
                      activeForm === "login"
                        ? "text-blue-400 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Đăng nhập
                  </button>

                  <button
                    onClick={() => setActiveForm("register")}
                    className={`pb-2.5 transition relative cursor-pointer ${
                      activeForm === "register"
                        ? "text-blue-400 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Tạo tài khoản mới
                  </button>

                  <button
                    onClick={() => setActiveForm("forgot")}
                    className={`pb-2.5 transition relative cursor-pointer ${
                      activeForm === "forgot"
                        ? "text-blue-400 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Quên mật khẩu?
                  </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleTestSubmit} className="space-y-4">
                  {/* FORM ĐĂNG NHẬP */}
                  {activeForm === "login" && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Tên đăng nhập hoặc Email
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Nhập username hoặc email..."
                            className="w-full h-11 pl-10 pr-4 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-xs font-semibold text-slate-300">Mật khẩu</label>
                          <button
                            type="button"
                            onClick={() => setActiveForm("forgot")}
                            className="text-xs text-blue-400 hover:underline cursor-pointer"
                          >
                            Quên mật khẩu?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhập mật khẩu..."
                            className="w-full h-11 pl-10 pr-10 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full h-11 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer mt-2"
                      >
                        <span>Đăng nhập ngay</span>
                        <ArrowRight size={16} />
                      </button>
                    </>
                  )}

                  {/* FORM ĐĂNG KÝ */}
                  {activeForm === "register" && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Tên tài khoản (Username)
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Ví dụ: nguyenvana"
                            className="w-full h-11 pl-10 pr-4 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Họ và tên hiển thị
                        </label>
                        <input
                          type="text"
                          value={fullname}
                          onChange={(e) => setFullname(e.target.value)}
                          placeholder="Ví dụ: Nguyễn Văn A"
                          className="w-full h-11 px-4 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Địa chỉ Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
                            className="w-full h-11 pl-10 pr-4 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Mật khẩu bảo vệ
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Tối thiểu 6 ký tự"
                            className="w-full h-11 pl-10 pr-4 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer mt-2"
                      >
                        <span>Tạo tài khoản miễn phí</span>
                        <ArrowRight size={16} />
                      </button>
                    </>
                  )}

                  {/* FORM QUÊN MẬT KHẨU */}
                  {activeForm === "forgot" && (
                    <>
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300 leading-relaxed">
                        Nhập email đã đăng ký để nhận mã OTP xác thực bảo mật 6 số.
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Email khôi phục
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nhap-email@gmail.com"
                            className="w-full h-11 pl-10 pr-4 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                          />
                        </div>
                      </div>

                      {otpSent && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Mã xác nhận OTP (6 số)
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Nhập 6 số OTP (Thử: 123456)"
                            className="w-full h-11 px-4 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-center tracking-widest font-mono text-slate-100 focus:outline-none focus:border-blue-500 transition"
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer mt-2"
                      >
                        {otpSent ? "Xác nhận OTP & Đổi mật khẩu" : "Gửi mã OTP về Email"}
                      </button>
                    </>
                  )}
                </form>

                <div className="pt-2 text-center text-xs text-slate-500">
                  Bảo mật cấp ngân hàng với mã hóa E2E & Chứng thực JWT
                </div>
              </div>
            </div>

            {/* Cột phải: Hero Live Preview (Khắc phục hoàn toàn sự trống trải) */}
            <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#0b0f19] border-l border-slate-800/80 p-12 flex-col justify-between overflow-hidden">
              {/* Vầng sáng nền mềm mại */}
              <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Tag giới thiệu trên cùng */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Máy chủ Realtime đang hoạt động ổn định</span>
                </div>
                <span className="text-xs text-slate-500">Phiên bản 2.4.0</span>
              </div>

              {/* Mô phỏng khung chat chân thực ở giữa màn hình */}
              <div className="relative z-10 my-auto max-w-[460px] w-full mx-auto">
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-5 shadow-2xl shadow-black/60 space-y-4">
                  {/* Header cuộc trò chuyện mini */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"
                          alt="Avatar"
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/40"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">Minh Trang (Team Lead)</h4>
                        <span className="text-[11px] text-emerald-400">Đang trực tuyến</span>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-medium">
                      Socket.IO
                    </span>
                  </div>

                  {/* Bong bóng tin nhắn */}
                  <div className="space-y-3 text-xs">
                    <div className="flex gap-2">
                      <div className="bg-slate-800/90 text-slate-200 p-3 rounded-2xl rounded-tl-xs max-w-[85%] border border-slate-700/40 leading-relaxed">
                        Chào Sỹ! Giao diện mới nhìn sang và thoáng mắt ghê, hết hẳn cảm giác bị trơ trọi rồi nè! 🚀
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-xs max-w-[85%] leading-relaxed shadow-sm">
                        Đúng rồi anh! Bên trái là form đăng nhập nhanh, bên phải có live preview nhìn uy tín hơn hẳn luôn 😍
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="bg-slate-800/90 text-slate-200 p-3 rounded-2xl rounded-tl-xs max-w-[85%] border border-slate-700/40 leading-relaxed flex items-center gap-2">
                        <span>Âm thanh thông báo tin nhắn mới</span>
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badge đính kèm nổi bên dưới */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                      <Zap size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">&lt; 15ms</p>
                      <p className="text-[10px] text-slate-400">Độ trễ truyền tin</p>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Bảo mật OTP</p>
                      <p className="text-[10px] text-slate-400">Xác thực tài khoản</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lời chứng thực ở đáy cột */}
              <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between">
                <span>© 2026 WebChat Realtime System</span>
                <span className="text-slate-500">Mẫu layout khuyên dùng cho ứng dụng Chat</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= STYLE 2: AURORA GLASSMORPHISM ================= */}
        {activeStyle === "aurora" && (
          <div className="flex-1 min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6 relative bg-[#090b14] overflow-hidden">
            {/* Các quả cầu ánh sáng Aurora phát sáng nền */}
            <div className="absolute top-10 left-1/4 w-96 h-96 bg-purple-600/25 rounded-full blur-[100px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-500/15 rounded-full blur-[90px] pointer-events-none" />

            {/* Thẻ Kính Thần Thái (Glass Card) */}
            <div className="relative z-10 w-full max-w-[440px] bg-white/[0.04] backdrop-blur-2xl border border-white/15 rounded-3xl p-8 shadow-2xl shadow-purple-950/40 space-y-6">
              {/* Header Card */}
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/30 mb-1">
                  <Sparkles size={22} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  {activeForm === "login"
                    ? "Chào mừng trở lại"
                    : activeForm === "register"
                    ? "Gia nhập cộng đồng Chat"
                    : "Khôi phục tài khoản"}
                </h2>
                <p className="text-xs text-slate-400">
                  {activeForm === "login"
                    ? "Nhập tài khoản để tiếp tục cuộc trò chuyện"
                    : "Trải nghiệm nhắn tin mượt mà không độ trễ"}
                </p>
              </div>

              {/* Pill Switcher */}
              <div className="p-1 bg-white/5 border border-white/10 rounded-xl flex text-xs">
                <button
                  onClick={() => setActiveForm("login")}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    activeForm === "login" ? "bg-white/15 text-white font-semibold" : "text-slate-400"
                  }`}
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => setActiveForm("register")}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    activeForm === "register" ? "bg-white/15 text-white font-semibold" : "text-slate-400"
                  }`}
                >
                  Đăng ký
                </button>
                <button
                  onClick={() => setActiveForm("forgot")}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    activeForm === "forgot" ? "bg-white/15 text-white font-semibold" : "text-slate-400"
                  }`}
                >
                  Quên MK
                </button>
              </div>

              {/* Form Input */}
              <form onSubmit={handleTestSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Tên tài khoản hoặc Email
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="nguyenvana hoặc email..."
                    className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400 focus:bg-white/[0.08] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Mật khẩu</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400 focus:bg-white/[0.08] transition"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-95 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  {activeForm === "login" ? "Đăng nhập ngay ✨" : "Tiến hành đăng ký 🚀"}
                </button>
              </form>

              <div className="text-center text-[11px] text-slate-500">
                Hiệu ứng kính mờ Glassmorphism cao cấp phong cách iOS 18
              </div>
            </div>
          </div>
        )}

        {/* ================= STYLE 3: MODERN SWISS LIGHT ================= */}
        {activeStyle === "clean" && (
          <div className="flex-1 min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6 bg-[#f8fafc] text-slate-800 relative">
            {/* Lưới chấm bi thanh lịch nền sau */}
            <div
              className="absolute inset-0 pointer-events-none opacity-40"
              style={{
                backgroundImage: "radial-gradient(#94a3b8 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            {/* Thẻ Card trắng tinh khôi nhưng có chiều sâu */}
            <div className="relative z-10 w-full max-w-[420px] bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xl shadow-slate-200/50 space-y-6">
              {/* Logo & Headline */}
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold mb-3 shadow-md shadow-blue-600/20">
                  <MessageSquare size={20} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  {activeForm === "login" ? "Chào mừng trở lại" : "Tạo tài khoản ChatWave"}
                </h2>
                <p className="text-xs text-slate-500">
                  Nền tảng nhắn tin thời gian thực nhanh và bảo mật
                </p>
              </div>

              {/* Switch Buttons */}
              <div className="flex border-b border-slate-100 text-xs font-semibold gap-4 pb-2">
                <button
                  onClick={() => setActiveForm("login")}
                  className={`cursor-pointer ${
                    activeForm === "login" ? "text-blue-600 border-b-2 border-blue-600 pb-2 -mb-2" : "text-slate-400"
                  }`}
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => setActiveForm("register")}
                  className={`cursor-pointer ${
                    activeForm === "register" ? "text-blue-600 border-b-2 border-blue-600 pb-2 -mb-2" : "text-slate-400"
                  }`}
                >
                  Đăng ký
                </button>
                <button
                  onClick={() => setActiveForm("forgot")}
                  className={`cursor-pointer ${
                    activeForm === "forgot" ? "text-blue-600 border-b-2 border-blue-600 pb-2 -mb-2" : "text-slate-400"
                  }`}
                >
                  Quên mật khẩu
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleTestSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tài khoản hoặc Email
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="nguyenvana@gmail.com"
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 transition"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700">Mật khẩu</label>
                    <button
                      type="button"
                      onClick={() => setActiveForm("forgot")}
                      className="text-xs text-blue-600 hover:underline cursor-pointer"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 transition"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold text-sm rounded-xl transition shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Đăng nhập
                </button>
              </form>

              <div className="pt-2 text-center text-[11px] text-slate-400 border-t border-slate-100">
                Phong cách Swiss Style chuẩn file MASTER.md: Tối giản, thanh thoát
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= FOOTER HỎI Ý KIẾN ================= */}
      <footer className="h-14 border-t border-white/10 bg-[#0f141f] px-6 flex items-center justify-between text-xs text-slate-400 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">Bạn thích Option nào hơn?</span>
          <span className="hidden sm:inline">
            (Option 1 đang được các ứng dụng như Discord, Slack, Linear áp dụng rất thành công vì không bao giờ bị trống trải)
          </span>
        </div>

        <button
          onClick={() => {
            toast.success("Tuyệt vời! Hãy cho tôi biết bạn ưng ý Option nào, tôi sẽ áp dụng thay thế ngay vào trang Login/Register/ForgotPass chính thức cho bạn!");
          }}
          className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold transition cursor-pointer"
        >
          Chọn Style này
        </button>
      </footer>
    </div>
  );
}
