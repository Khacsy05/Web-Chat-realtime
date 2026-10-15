import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  User,
  AtSign,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Zap,
  Check,
  Rocket,
  Shield,
  Infinity as InfinityIcon,
  Star,
  LogIn,
  RotateCw,
} from "lucide-react";
import auth from "@/service/auth";

// Validation schema
const registerSchema = yup.object().shape({
  fullname: yup
    .string()
    .required("Vui lòng nhập họ và tên")
    .trim(),
  username: yup
    .string()
    .required("Vui lòng nhập tên người dùng (Handle)")
    .min(3, "Tên người dùng phải từ 3 ký tự")
    .matches(
      /^[a-zA-Z0-9_.-]+$/,
      "Chỉ bao gồm chữ cái, số và dấu gạch dưới"
    )
    .trim(),
  email: yup
    .string()
    .required("Vui lòng nhập địa chỉ email")
    .email("Định dạng email không hợp lệ")
    .trim(),
  password: yup
    .string()
    .required("Vui lòng nhập mật khẩu")
    .min(6, "Mật khẩu tối thiểu 6 ký tự"),
  confirmPassword: yup
    .string()
    .required("Vui lòng xác nhận mật khẩu")
    .oneOf([yup.ref("password")], "Mật khẩu xác nhận không khớp"),
  agreeTerms: yup
    .boolean()
    .oneOf([true], "Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách bảo mật"),
});

const EMPTY_FORM = {
  fullname: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  agreeTerms: true,
};

const RegisterUser = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: "onChange",
    defaultValues: EMPTY_FORM,
  });

  const usernameValue = watch("username", "");
  const passwordValue = watch("password", "");

  // Đánh giá độ mạnh mật khẩu
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "", color: "bg-slate-200" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1)
      return { score: 1, label: "Yếu", color: "bg-rose-500", text: "text-rose-500" };
    if (score === 2)
      return { score: 2, label: "Trung bình", color: "bg-amber-500", text: "text-amber-500" };
    if (score === 3)
      return { score: 3, label: "Khá mạnh", color: "bg-blue-500", text: "text-blue-500" };
    return { score: 4, label: "Rất mạnh", color: "bg-emerald-500", text: "text-emerald-500" };
  };

  const strength = getPasswordStrength(passwordValue);
  const isUsernameValid = usernameValue.length >= 3 && !errors.username;

  const handleRegister = async (data) => {
    setIsLoading(true);
    try {
      const { confirmPassword, agreeTerms, ...registerData } = data;
      await auth.register(registerData);
      toast.success("Đăng ký tài khoản Zola thành công! 🎉 Vui lòng đăng nhập.");
      navigate("/login");
    } catch (error) {
      console.error("Register failed:", error);
      const backendMessage =
        error?.data?.message ||
        error?.response?.data?.message ||
        "Đăng ký thất bại, tên đăng nhập hoặc email đã tồn tại";
      toast.error(backendMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialClick = (provider) => {
    toast.info(`Tính năng đăng ký bằng ${provider} đang được phát triển`);
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col font-sans select-none relative overflow-y-auto bg-[#f8fafc]"
      style={{
        backgroundImage: `
          radial-gradient(#cbd5e1 0.8px, transparent 0.8px),
          radial-gradient(ellipse 80% 50% at 50% -20%, rgba(199, 210, 254, 0.4), transparent)
        `,
        backgroundSize: "24px 24px, 100% 100%",
      }}
    >
      {/* ================= 1. TOP NAVBAR ================= */}
      <header className="h-16 px-6 sm:px-12 flex items-center justify-between z-20 shrink-0">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3b82f6] to-[#4338ca] flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
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

        {/* Right Auth Switch */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs sm:text-sm text-slate-500 font-medium">
            Đã có tài khoản?
          </span>
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 shadow-xs transition"
          >
            <LogIn size={15} />
            <span>Đăng nhập</span>
          </Link>
        </div>
      </header>

      {/* ================= 2. MAIN 2-COLUMN SECTION ================= */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 lg:px-12 py-6 sm:py-8 z-10">
        <div className="w-full max-w-[1240px] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ----------------- LEFT COLUMN: REGISTER CARD ----------------- */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-[500px] bg-white rounded-3xl border border-slate-200/80 shadow-[0_15px_45px_rgba(0,0,0,0.06)] p-6 sm:p-9 animate-fade-in">
              
              {/* Badge trên cùng */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100/80 text-blue-600 text-xs font-semibold mb-4">
                <Zap size={14} className="fill-blue-500 text-blue-500" />
                <span>Bắt đầu miễn phí trong 30 giây</span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1.5 mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                  <span>Tạo tài khoản mới</span>
                  <span>🚀</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Tham gia Zola để kết nối, trò chuyện và làm việc nhóm tức thì với độ trễ siêu thấp.
                </p>
              </div>

              {/* Nút Social (Google & GitHub) */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <button
                  type="button"
                  onClick={() => handleSocialClick("Google")}
                  className="flex items-center justify-center gap-2 h-11 px-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition text-xs sm:text-sm font-semibold text-slate-700 cursor-pointer shadow-xs"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 17.4C3.7 21.1 7.5 24 12 24z"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialClick("GitHub")}
                  className="flex items-center justify-center gap-2 h-11 px-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition text-xs sm:text-sm font-semibold text-slate-700 cursor-pointer shadow-xs"
                >
                  <svg className="w-4 h-4 shrink-0 fill-slate-800" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>

              {/* Đường kẻ phân cách */}
              <div className="relative flex items-center justify-center mb-5">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider shrink-0">
                  Hoặc đăng ký bằng email
                </span>
              </div>

              {/* Form Input Chính */}
              <form onSubmit={handleSubmit(handleRegister)} className="space-y-3.5">
                {/* 1. Họ và tên */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      {...register("fullname")}
                      type="text"
                      placeholder="Nguyễn Văn An"
                      autoComplete="name"
                      disabled={isLoading}
                      className={`w-full h-11 pl-10 pr-4 bg-slate-50/70 border rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-100 transition ${
                        errors.fullname ? "border-red-500" : "border-slate-200"
                      }`}
                    />
                  </div>
                  {errors.fullname && (
                    <p className="text-xs font-medium text-red-500 mt-1">
                      {errors.fullname.message}
                    </p>
                  )}
                </div>

                {/* 2. Tên người dùng (Handle) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Tên người dùng (Handle)
                    </label>
                    {isUsernameValid && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                        <Check size={12} className="stroke-[3]" />
                        <span>Hợp lệ</span>
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      {...register("username")}
                      type="text"
                      placeholder="nguyenan_dev"
                      autoComplete="username"
                      disabled={isLoading}
                      className={`w-full h-11 pl-10 pr-4 bg-slate-50/70 border rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-100 transition ${
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

                {/* 3. Email công việc / cá nhân */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email công việc / cá nhân
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="an.nguyen@congty.com"
                      autoComplete="email"
                      disabled={isLoading}
                      className={`w-full h-11 pl-10 pr-4 bg-slate-50/70 border rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-100 transition ${
                        errors.email ? "border-red-500" : "border-slate-200"
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs font-medium text-red-500 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* 4. Mật khẩu */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Mật khẩu
                    </label>
                    {passwordValue && (
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${strength.text}`}>
                        <ShieldCheck size={13} />
                        <span>{strength.label}</span>
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••••••"
                      autoComplete="new-password"
                      disabled={isLoading}
                      className={`w-full h-11 pl-10 pr-11 bg-slate-50/70 border rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-100 transition ${
                        errors.password ? "border-red-500" : "border-slate-200"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer transition"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* 4 thanh đo độ mạnh mật khẩu y hệt trong ảnh */}
                  <div className="flex items-center gap-1.5 pt-2">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          strength.score >= step
                            ? strength.color
                            : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tối thiểu 6 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt.
                  </p>
                  {errors.password && (
                    <p className="text-xs font-medium text-red-500 mt-0.5">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* 5. Xác nhận mật khẩu */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <RotateCw className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      {...register("confirmPassword")}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••••••••••"
                      autoComplete="new-password"
                      disabled={isLoading}
                      className={`w-full h-11 pl-10 pr-11 bg-slate-50/70 border rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-100 transition ${
                        errors.confirmPassword ? "border-red-500" : "border-slate-200"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer transition"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs font-medium text-red-500 mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* 6. Checkbox Điều khoản */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("agreeTerms")}
                      className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 leading-relaxed">
                      Tôi đồng ý với{" "}
                      <span className="text-blue-600 font-medium hover:underline cursor-pointer">
                        Điều khoản dịch vụ
                      </span>{" "}
                      và{" "}
                      <span className="text-blue-600 font-medium hover:underline cursor-pointer">
                        Chính sách bảo mật
                      </span>{" "}
                      của Zola.
                    </span>
                  </label>
                  {errors.agreeTerms && (
                    <p className="text-xs text-red-500 font-medium mt-1">
                      {errors.agreeTerms.message}
                    </p>
                  )}
                </div>

                {/* 7. Nút Submit Tạo tài khoản */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 sm:h-12 rounded-xl bg-[#3b5bfd] hover:bg-[#2d4df0] active:bg-[#2342e0] text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang xử lý tạo tài khoản...</span>
                      </>
                    ) : (
                      <>
                        <span>Tạo tài khoản Zola</span>
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </div>

                {/* Link Đăng nhập ngay */}
                <div className="text-center pt-2">
                  <span className="text-xs text-slate-500 font-medium">
                    Đã có tài khoản?{" "}
                  </span>
                  <Link
                    to="/login"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline transition"
                  >
                    Đăng nhập ngay
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* ----------------- RIGHT COLUMN: SHOWCASE CARDS ----------------- */}
          <div className="lg:col-span-6 flex flex-col gap-4 max-w-[540px] mx-auto w-full">
            
            {/* CARD 1: CỘNG ĐỒNG TIN CẬY */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-blue-600 tracking-wider uppercase">
                  Cộng đồng tin cậy
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-[11px] font-semibold text-emerald-600">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  12.480+ online
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3">
                Hơn 250.000+ lập trình viên & đội ngũ
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center -space-x-2">
                  <img
                    className="inline-block size-8 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
                    alt="avatar 1"
                  />
                  <img
                    className="inline-block size-8 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces"
                    alt="avatar 2"
                  />
                  <img
                    className="inline-block size-8 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces"
                    alt="avatar 3"
                  />
                  <div className="flex items-center justify-center size-8 rounded-full bg-indigo-600 text-white text-[11px] font-bold ring-2 ring-white">
                    +99
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-snug">
                  Gia nhập cùng các kỹ sư hàng đầu từ VNG, FPT, MoMo, Shopee & Tech Startups.
                </p>
              </div>
            </div>

            {/* CARD 2: LIVE MOCK TERMINAL & WEBSOCKET CHAT */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-3">
              {/* Window Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <div className="size-2.5 rounded-full bg-rose-400" />
                  <div className="size-2.5 rounded-full bg-amber-400" />
                  <div className="size-2.5 rounded-full bg-emerald-400" />
                  <span className="text-xs font-semibold text-slate-600 ml-2">
                    #deploy-production
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>WebSocket Connected</span>
                </div>
              </div>

              {/* Message 1: Tech Lead */}
              <div className="bg-slate-50/70 rounded-xl p-3 flex items-start gap-3 border border-slate-100">
                <div className="size-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  TL
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Hoàng Nam (Tech Lead)
                    </span>
                    <span className="text-[10px] text-slate-400">10:42 AM</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Bản build v2.4 đã sẵn sàng! Hạ tầng phân tán mới phản hồi mượt mà không độ trễ. 🚀
                  </p>
                </div>
              </div>

              {/* Message 2: SyncBot CI/CD */}
              <div className="bg-slate-50/70 rounded-xl p-3 flex items-start gap-3 border border-slate-100">
                <div className="size-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  SC
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      SyncBot CI/CD
                    </span>
                    <span className="text-[10px] text-slate-400">Vừa xong</span>
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">
                    <Check size={12} className="stroke-[3]" />
                    <span>Pipeline Passed: 48/48 Microservices Healthy (12ms)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 3: ĐẶC QUYỀN HẠ TẦNG */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                Đặc quyền hạ tầng khi tham gia Zola
              </h3>

              <div className="space-y-3.5">
                {/* Feature 1 */}
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Rocket size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                      Độ trễ cực thấp dưới 15ms
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Kiến trúc WebSocket thế hệ mới phân tán toàn cầu, đồng bộ tức thì trên mọi thiết bị.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Shield size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                      Mã hóa đầu cuối E2EE & Chuẩn SOC2 Type II
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Tin nhắn, cuộc gọi và tệp tin được mã hóa tuyệt đối, tuân thủ tiêu chuẩn an ninh cao nhất.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 mt-0.5">
                    <InfinityIcon size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                      Không giới hạn lịch sử & Tệp tin dung lượng lớn
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Tìm kiếm thông minh toàn văn bản trong tích tắc, gửi code snippet và tài liệu lên đến 2GB.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 4: TESTIMONIAL REVIEW */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2.5">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                ))}
                <span className="text-xs font-bold text-slate-700 ml-1.5">5.0</span>
              </div>

              <p className="text-xs text-slate-600 italic leading-relaxed">
                “Zola thay đổi hoàn toàn cách đội ngũ kỹ thuật của chúng tôi trao đổi trực tiếp trong các đợt phát hành quan trọng. Tốc độ thực sự vượt trội so với các nền tảng chat doanh nghiệp truyền thống.”
              </p>

              <div className="flex items-center gap-2.5 pt-1">
                <img
                  className="size-8 rounded-full object-cover ring-1 ring-slate-200"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces"
                  alt="Minh Trần"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">Minh Trần</div>
                  <div className="text-[11px] text-slate-400">
                    Head of Engineering tại Nexus Labs
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* ================= 3. BOTTOM FOOTER ================= */}
      <footer className="h-14 px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200/60 text-xs text-slate-500 z-20 shrink-0 gap-2 sm:gap-0 mt-4">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-indigo-900">Zola</span>
          <span>|</span>
          <span>© 2026 Zola Inc. Kết nối tức thì, bảo mật tuyệt đối.</span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 text-slate-500 font-medium">
          <a href="#terms" className="hover:text-indigo-600 transition">
            Điều khoản
          </a>
          <a href="#privacy" className="hover:text-indigo-600 transition">
            Chính sách bảo mật
          </a>
          <a href="#status" className="hover:text-indigo-600 transition">
            Trạng thái hệ thống
          </a>
          <a href="#contact" className="hover:text-indigo-600 transition">
            Liên hệ
          </a>
        </div>
      </footer>
    </div>
  );
};

export default RegisterUser;