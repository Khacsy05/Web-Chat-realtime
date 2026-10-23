import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  KeyRound,
  Check,
} from "lucide-react";
import auth from "@/service/auth";

const authSchema = yup.object().shape({
  password: yup
    .string()
    .required("Vui lòng nhập mật khẩu mới")
    .min(6, "Mật khẩu ít nhất 6 ký tự"),
  confirmPassword: yup
    .string()
    .required("Vui lòng xác nhận mật khẩu")
    .oneOf([yup.ref("password")], "Mật khẩu xác nhận không khớp"),
});

const strengthLevels = [
  { label: "Rất yếu", color: "bg-red-400", width: "w-1/4" },
  { label: "Yếu", color: "bg-orange-400", width: "w-2/4" },
  { label: "Trung bình", color: "bg-yellow-400", width: "w-3/4" },
  { label: "Mạnh", color: "bg-emerald-500", width: "w-full" },
];

const getPasswordStrength = (password) => {
  if (!password) return -1;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score - 1; // 0..3
};

const ResetPass = () => {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(authSchema),
    mode: "onSubmit",
  });

  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");
  const navigate = useNavigate();

  const strength = getPasswordStrength(passwordValue);
  const strengthInfo = strength >= 0 ? strengthLevels[strength] : null;

  const handleResetPass = async (data) => {
    if (!token) {
      toast.error("Token không hợp lệ hoặc đã hết hạn");
      return;
    }
    setIsSubmitting(true);
    try {
      await auth.ResetPass({ token, newPassword: data.password });
      toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      navigate("/login");
    } catch (error) {
      toast.error("Yêu cầu quá hạn hoặc lỗi hệ thống");
    } finally {
      setIsSubmitting(false);
    }
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
      {/* ===== TOP NAVBAR ===== */}
      <header className="h-14 sm:h-16 px-6 sm:px-12 flex items-center justify-between z-20 shrink-0">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3b82f6] to-[#4338ca] flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-[#1e1b4b]">
            Zola
          </span>
        </Link>

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

        <div className="flex items-center gap-3">
          <span className="text-xs sm:text-sm text-slate-500 font-medium hidden sm:inline">
            Đã đổi xong?
          </span>
          <Link
            to="/login"
            className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-[#3730a3] hover:bg-[#312e81] shadow-xs hover:shadow transition flex items-center gap-1.5"
          >
            <ArrowRight size={14} />
            Đăng nhập
          </Link>
        </div>
      </header>

      {/* ===== MAIN 2-COLUMN ===== */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 lg:px-12 py-3 sm:py-5 z-10">
        <div className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">

          {/* ===== LEFT: FORM CARD ===== */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[440px] bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xl shadow-slate-200/60 border border-slate-100/90 relative">

              {/* Status Pill */}
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] text-[10px] sm:text-[11px] font-semibold text-[#16a34a] mb-3">
                <CheckCircle2 size={13} />
                <span>OTP đã được xác thực thành công</span>
              </div>

              {/* Title */}
              <div className="space-y-1 mb-5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <span>Đặt lại mật khẩu</span>
                  <span className="text-xl sm:text-2xl">🔑</span>
                </h1>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tạo mật khẩu mới mạnh mẽ hơn. Zola sẽ tự ngắt kết nối các phiên cũ để bảo vệ tài khoản của bạn.
                </p>
              </div>

              <form onSubmit={handleSubmit(handleResetPass)} className="space-y-4">
                {/* MẬT KHẨU MỚI */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      {...register("password")}
                      type={showPass ? "text" : "password"}
                      placeholder="Tối thiểu 6 ký tự"
                      disabled={isSubmitting}
                      onChange={(e) => setPasswordValue(e.target.value)}
                      className={`w-full h-10 sm:h-11 pl-10 pr-11 bg-slate-50/70 border rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100 transition ${
                        errors.password ? "border-red-500" : "border-slate-200"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password strength bar */}
                  {passwordValue && strengthInfo && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${strengthInfo.color} ${strengthInfo.width}`}
                        />
                      </div>
                      <p className={`text-[10px] font-semibold ${
                        strength === 3 ? "text-emerald-600" :
                        strength === 2 ? "text-yellow-600" :
                        strength === 1 ? "text-orange-500" : "text-red-500"
                      }`}>
                        Độ mạnh: {strengthInfo.label}
                      </p>
                    </div>
                  )}

                  {errors.password && (
                    <p className="text-xs font-medium text-red-500 mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* XÁC NHẬN MẬT KHẨU */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      {...register("confirmPassword")}
                      type={showConfirm ? "text" : "password"}
                      placeholder="Nhập lại mật khẩu mới"
                      disabled={isSubmitting}
                      className={`w-full h-10 sm:h-11 pl-10 pr-11 bg-slate-50/70 border rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100 transition ${
                        errors.confirmPassword ? "border-red-500" : "border-slate-200"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs font-medium text-red-500 mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Badge bảo mật */}
                <div className="flex items-center justify-between pt-0.5">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] text-[10px] sm:text-[11px] font-semibold text-[#16a34a]">
                    <ShieldCheck size={13} />
                    <span>Bảo vệ 2FA</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Phiên cũ sẽ bị vô hiệu hóa
                  </span>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 sm:h-11 mt-1 bg-gradient-to-r from-[#4f46e5] to-[#4338ca] hover:from-[#4338ca] hover:to-[#3730a3] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-500/25 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang cập nhật...</span>
                    </>
                  ) : (
                    <>
                      <span>Xác nhận đổi mật khẩu</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              {/* Footer link */}
              <div className="mt-4 text-center text-xs font-medium text-slate-600">
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

          {/* ===== RIGHT: INFO PANEL ===== */}
          <div className="lg:col-span-7 hidden lg:flex flex-col gap-3.5">

            {/* Bước hiện tại */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <KeyRound size={20} />
                </div>
                <h2 className="font-bold text-sm text-slate-900">
                  Bạn đang ở bước cuối cùng
                </h2>
              </div>

              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: "Nhập email & Nhận OTP",
                    desc: "Đã hoàn thành.",
                    done: true,
                  },
                  {
                    step: 2,
                    title: "Xác thực mã OTP 6 số",
                    desc: "Đã hoàn thành.",
                    done: true,
                  },
                  {
                    step: 3,
                    title: "Đặt lại mật khẩu mới",
                    desc: "Thiết lập mật khẩu mạnh mới. Zola sẽ tự động ngắt kết nối các phiên đăng nhập cũ để bảo vệ quyền riêng tư của bạn.",
                    done: false,
                    active: true,
                  },
                ].map(({ step, title, desc, done, active }) => (
                  <div key={step} className="flex items-start gap-3.5">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5 ${
                        done
                          ? "bg-emerald-500 text-white"
                          : active
                          ? "bg-[#4f46e5] text-white shadow-sm shadow-indigo-300"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {done ? <Check size={14} strokeWidth={3} /> : step}
                    </div>
                    <div>
                      <p className={`text-xs font-bold mb-0.5 ${done ? "text-emerald-700 line-through" : "text-slate-800"}`}>
                        {title}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips mật khẩu mạnh */}
            <div className="bg-indigo-50/60 rounded-2xl border border-indigo-100 p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <ShieldCheck size={16} />
                </div>
                <h3 className="font-bold text-xs text-slate-900">
                  Mẹo tạo mật khẩu mạnh
                </h3>
              </div>
              <div className="space-y-2">
                {[
                  "Ít nhất 8 ký tự trở lên",
                  "Kết hợp chữ hoa, chữ thường và số",
                  "Thêm ký tự đặc biệt (!@#$%) để tăng độ bảo mật",
                  "Không dùng tên, ngày sinh, hay mật khẩu cũ",
                ].map((tip, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-slate-600">
                    <span className="w-4 h-4 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {i + 1}
                    </span>
                    {tip}
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2 col */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Bảo mật chuẩn SOC2</h4>
                  <p className="text-[11px] text-slate-500">Dữ liệu lưu trữ riêng tư</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <RefreshCw size={19} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Đồng bộ đa thiết bị</h4>
                  <p className="text-[11px] text-slate-500">Web, iOS, Android & Mac</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="py-2.5 sm:py-3 px-6 sm:px-12 border-t border-slate-200/80 bg-white/70 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] sm:text-xs text-slate-500 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-800 text-xs sm:text-sm">Zola</span>
          <span className="hidden sm:inline text-slate-300">|</span>
          <span>© 2026 Zola Inc. Kết nối tức thì, bảo mật tuyệt đối.</span>
        </div>
        <div className="flex items-center gap-6 font-medium">
          <a href="#terms" className="hover:text-slate-800 transition">Điều khoản</a>
          <a href="#privacy" className="hover:text-slate-800 transition">Chính sách bảo mật</a>
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Trạng thái hệ thống</span>
          </div>
          <a href="#contact" className="hover:text-slate-800 transition">Liên hệ</a>
        </div>
      </footer>
    </div>
  );
};

export default ResetPass;