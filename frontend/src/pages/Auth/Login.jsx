import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Phone,
  Video,
  MoreVertical,
  Play,
  Pause,
  CheckCheck,
  Loader2,
  Wifi,
  RefreshCw,
  MessageSquare,
  Check,
} from "lucide-react";
import auth from "@/service/auth";
import useAuthStore from "@/stores/useAuthStore";
import socket from "@/lib/socket";

const authSchema = yup.object().shape({
  username: yup.string().required("Vui lòng nhập email hoặc tên người dùng"),
  password: yup.string().required("Vui lòng nhập mật khẩu"),
});

const EMPTY_FORM = {
  username: "",
  password: "",
};

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(authSchema),
    mode: "onSubmit",
    defaultValues: EMPTY_FORM,
  });

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (data) => {
    setIsLoading(true);
    try {
      const response = await auth.login(data);
      setAuth(response.data.user, response.data.token);
      toast.success("Đăng nhập thành công 🎉");
      socket.emit("join", String(response.data.user.idUser));
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      const backendMessage =
        error?.data?.message ||
        error?.response?.data?.message ||
        "Tài khoản hoặc mật khẩu không chính xác";
      toast.error(backendMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialClick = (provider) => {
    toast.info(`Tính năng đăng nhập bằng ${provider} đang được kết nối`);
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col font-sans select-none relative overflow-y-auto bg-[#f4f7fc]"
      style={{
        backgroundImage: `
          radial-gradient(#cbd5e1 0.8px, transparent 0.8px),
          radial-gradient(ellipse 80% 50% at 50% -20%, rgba(199, 210, 254, 0.4), transparent)
        `,
        backgroundSize: "24px 24px, 100% 100%",
      }}
    >
      {/* ================= 1. TOP NAVBAR ================= */}
      <header className="h-14 sm:h-16 px-6 sm:px-12 flex items-center justify-between z-20 shrink-0">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3b82f6] to-[#4338ca] flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <svg
              className="w-4.5 h-4.5 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-[#1e1b4b]">
            Zola
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs sm:text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-indigo-600 transition">
            Tính năng
          </a>
          <a href="#community" className="hover:text-indigo-600 transition">
            Cộng đồng
          </a>
          <a href="#support" className="hover:text-indigo-600 transition">
            Hỗ trợ
          </a>
        </nav>

        {/* Right Auth Links */}
        <div className="flex items-center gap-3">
          <span className="text-xs sm:text-sm font-semibold text-indigo-600 border-b-2 border-indigo-600 pb-0.5 cursor-default">
            Đăng nhập
          </span>
          <Link
            to="/register"
            className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-[#3730a3] hover:bg-[#312e81] shadow-xs hover:shadow transition"
          >
            Đăng ký
          </Link>
        </div>
      </header>

      {/* ================= 2. MAIN 2-COLUMN SECTION ================= */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 lg:px-12 py-3 sm:py-5 z-10">
        <div className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          
          {/* ================= CỘT TRÁI: LOGIN FORM CARD (5/12 cols) ================= */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[440px] bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xl shadow-slate-200/60 border border-slate-100/90 relative">
              {/* WebSocket Status Pill */}
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#eff6ff] border border-[#dbeafe] text-[10px] sm:text-[11px] font-semibold text-[#2563eb] mb-3">
                <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-pulse" />
                <span>WebSocket v3.2 Đang kết nối</span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1 mb-4">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  <span>Chào mừng bạn trở lại!</span>
                  <span className="text-xl sm:text-2xl">👋</span>
                </h1>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Đăng nhập để kết nối và trò chuyện tức thì cùng bạn bè & đồng đội.
                </p>
              </div>

              {/* Form Input */}
              <form onSubmit={handleSubmit(handleLogin)} className="space-y-3">
                {/* 1. Username / Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email hoặc Tên người dùng
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      {...register("username")}
                      type="text"
                      placeholder="khanh.nguyen@techcorp.vn"
                      autoComplete="username"
                      disabled={isLoading}
                      className={`w-full h-10 sm:h-11 pl-10 pr-4 bg-slate-50/70 border rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100 transition ${
                        errors.username ? "border-red-500" : "border-slate-200"
                      }`}
                    />
                  </div>
                  {errors.username && (
                    <p className="text-xs font-medium text-red-500 mt-1">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                {/* 2. Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Mật khẩu
                    </label>
                    <Link
                      to="/forgotPassword"
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••••••"
                      autoComplete="current-password"
                      disabled={isLoading}
                      className={`w-full h-10 sm:h-11 pl-10 pr-11 bg-slate-50/70 border rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100 transition ${
                        errors.password ? "border-red-500" : "border-slate-200"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs font-medium text-red-500 mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* 3. Checkbox Ghi nhớ & Badge 2FA */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="text-xs font-medium text-slate-700">
                      Ghi nhớ đăng nhập
                    </span>
                  </label>

                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] text-[10px] sm:text-[11px] font-semibold text-[#16a34a]">
                    <ShieldCheck size={13} />
                    <span>Bảo vệ 2FA</span>
                  </div>
                </div>

                {/* 4. Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 sm:h-11 mt-1 bg-gradient-to-r from-[#4f46e5] to-[#4338ca] hover:from-[#4338ca] hover:to-[#3730a3] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-500/25 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang xác thực...</span>
                    </div>
                  ) : (
                    <>
                      <span>Đăng nhập vào Zola</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              {/* 5. Divider Hoặc tiếp tục với */}
              <div className="relative my-3 sm:my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-3 text-[10px] sm:text-[11px] font-medium text-slate-400">
                  Hoặc tiếp tục với
                </span>
              </div>

              {/* 6. Social Login Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSocialClick("Google")}
                  className="h-9 sm:h-10 px-3 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialClick("GitHub")}
                  className="h-9 sm:h-10 px-3 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
                >
                  <svg
                    className="w-3.5 h-3.5 fill-slate-800"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>

              {/* 7. Footer Register Link */}
              <div className="mt-3 sm:mt-4 text-center text-xs font-medium text-slate-600">
                <span>Chưa có tài khoản? </span>
                <Link
                  to="/register"
                  className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition"
                >
                  Đăng ký ngay
                </Link>
              </div>
            </div>
          </div>

          {/* ================= CỘT PHẢI: LIVE CHAT PREVIEW (7/12 cols) ================= */}
          <div className="lg:col-span-7 hidden lg:flex flex-col gap-3.5">
            {/* 1. Header Member Metrics Pill */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Avatar Stack */}
                <div className="flex -space-x-2">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=90"
                    alt="avatar"
                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=90"
                    alt="avatar"
                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=90"
                    alt="avatar"
                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  />
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">
                    +9k
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>12.480+ thành viên đang online</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Hà Nội, TP. Hồ Chí Minh, Đà Nẵng
                  </p>
                </div>
              </div>

              {/* Latency Badge */}
              <div className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-bold text-blue-600 flex items-center gap-1.5">
                <Wifi size={13} />
                <span>&lt; 15ms</span>
              </div>
            </div>

            {/* 2. Main Live Chat Box Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-lg shadow-slate-200/40 overflow-hidden">
              {/* Chat Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-[#1d4ed8] text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-sm">
                      ZL
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm text-slate-900">
                        Đội ngũ Sản phẩm Zola
                      </h3>
                      <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px]">
                        <Check size={11} strokeWidth={3} />
                      </div>
                    </div>
                    <span className="text-xs text-emerald-600 font-medium">
                      Kênh thảo luận công khai • 32 đồng đội
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-500">
                    <Phone size={17} />
                  </button>
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-500">
                    <Video size={17} />
                  </button>
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-500">
                    <MoreVertical size={17} />
                  </button>
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="p-5 space-y-4 bg-slate-50/40">
                {/* Tin nhắn 1: Minh Quân */}
                <div className="flex items-start gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=90"
                    alt="Minh Quân"
                    className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div className="space-y-1.5 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        Minh Quân
                      </span>
                      <span className="text-[10px] text-slate-400">09:41 SA</span>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-xs p-3.5 text-xs text-slate-800 leading-relaxed shadow-xs">
                      Chào team! Bản cập nhật WebSocket v3.2 đã triển khai thành công
                      lên cụm máy chủ APAC. Độ trễ tin nhắn hiện đã giảm xuống dưới
                      15ms rồi nhé! 🚀⚡
                    </div>

                    {/* Reactions Bar */}
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[11px] font-medium text-slate-700 shadow-2xs">
                        🔥 8
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[11px] font-medium text-slate-700 shadow-2xs">
                        ❤️ 12
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[11px] font-medium text-slate-700 shadow-2xs">
                        👍 5
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tin nhắn 2: Lan Chi (Voice Message) */}
                <div className="flex items-start gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=90"
                    alt="Lan Chi"
                    className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div className="space-y-1.5 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        Lan Chi
                      </span>
                      <span className="text-[10px] text-slate-400">09:42 SA</span>
                    </div>

                    {/* Audio Bubble */}
                    <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-xs p-3 flex items-center gap-3 shadow-xs">
                      <button
                        type="button"
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        className="w-8 h-8 rounded-full bg-[#4338ca] text-white flex items-center justify-center shrink-0 hover:opacity-90 transition cursor-pointer"
                      >
                        {isPlayingAudio ? (
                          <Pause size={14} />
                        ) : (
                          <Play size={14} className="ml-0.5" />
                        )}
                      </button>

                      {/* Sound Wave Bars */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 h-5">
                          {[30, 70, 45, 90, 60, 40, 85, 95, 40, 70, 50, 80, 40, 60].map(
                            (h, i) => (
                              <span
                                key={i}
                                className={`w-1 rounded-full transition-all ${
                                  i < 6 ? "bg-[#4338ca]" : "bg-slate-200"
                                }`}
                                style={{ height: `${h}%` }}
                              />
                            )
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          Tin nhắn thoại (0:24) • Mã hoá E2EE
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tin nhắn 3: Tin gửi đi từ Bạn */}
                <div className="flex justify-end">
                  <div className="space-y-1 max-w-[80%]">
                    <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-400">
                      <span>09:43 SA</span>
                      <span className="font-bold text-indigo-600">Bạn</span>
                    </div>

                    <div className="bg-[#4338ca] text-white rounded-2xl rounded-tr-xs p-3.5 text-xs leading-relaxed shadow-sm">
                      Tuyệt vời quá! Mình đang kiểm tra thử luồng mã hóa đầu-cuối trên
                      ứng dụng web, trải nghiệm gõ và đồng bộ mượt mà tuyệt đối.
                    </div>

                    <div className="flex items-center justify-end gap-1 text-[11px] font-semibold text-blue-600">
                      <CheckCheck size={14} />
                      <span>Đã đọc</span>
                    </div>
                  </div>
                </div>

                {/* Typing Indicator */}
                <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                  <div className="w-5 h-5 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-600 text-[10px]">
                    ✏️
                  </div>
                  <span className="text-xs">Minh đang nhập...</span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>

              {/* Chat Card Bottom Status */}
              <div className="px-5 py-3 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-slate-600" />
                  <span>Mã hoá hai đầu (End-to-End Encrypted)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <Wifi size={13} />
                  <span>Trực tuyến 99.99%</span>
                </div>
              </div>
            </div>

            {/* 3. Bottom Two Feature Badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">
                    Bảo mật chuẩn SOC2
                  </h4>
                  <p className="text-[11px] text-slate-500">Dữ liệu lưu trữ riêng tư</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <RefreshCw size={19} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">
                    Đồng bộ đa thiết bị
                  </h4>
                  <p className="text-[11px] text-slate-500">Web, iOS, Android & Mac</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ================= 3. FOOTER ================= */}
      <footer className="py-2.5 sm:py-3 px-6 sm:px-12 border-t border-slate-200/80 bg-white/70 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] sm:text-xs text-slate-500 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-800 text-xs sm:text-sm">Zola</span>
          <span className="hidden sm:inline text-slate-300">|</span>
          <span>© 2026 Zola Inc. Kết nối tức thì, bảo mật tuyệt đối.</span>
        </div>

        <div className="flex items-center gap-6 font-medium">
          <a href="#terms" className="hover:text-slate-800 transition">
            Điều khoản
          </a>
          <a href="#privacy" className="hover:text-slate-800 transition">
            Chính sách bảo mật
          </a>
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Trạng thái hệ thống</span>
          </div>
          <a href="#contact" className="hover:text-slate-800 transition">
            Liên hệ
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Login;