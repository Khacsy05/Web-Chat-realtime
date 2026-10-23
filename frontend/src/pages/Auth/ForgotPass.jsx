import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Mail,
  ShieldCheck,
  Loader2,
  ArrowRight,
  KeyRound,
  Lock,
  RefreshCw,
  Send,
  CheckCircle,
  Clock,
} from "lucide-react";
import auth from "@/service/auth";

const authSchema = yup.object().shape({
  email: yup
    .string()
    .required("Vui lòng nhập email")
    .email("Email không hợp lệ"),
  otp: yup
    .string()
    .required("Vui lòng nhập OTP")
    .matches(/^\d{6}$/, "OTP phải gồm đúng 6 chữ số"),
});

const ForgotPass = () => {
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(authSchema),
    mode: "onSubmit",
    defaultValues: { email: "", otp: "" },
  });

  const navigate = useNavigate();

  const handleSendOtp = async () => {
    const isValid = await trigger("email");
    if (!isValid) return;

    setIsSendingOtp(true);
    try {
      const email = getValues("email");
      await auth.sendOtp({ email });
      toast.success("Mã OTP đã được gửi đến email của bạn");
      setOtpSent(true);
    } catch (error) {
      toast.error("Gửi OTP thất bại, vui lòng thử lại");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (data) => {
    setIsVerifying(true);
    try {
      const res = await auth.verifyOtp(data);
      const resetToken = res.data.resetToken;
      toast.success("Xác thực thành công");
      navigate("/resetPassword?token=" + resetToken);
    } catch (error) {
      toast.error("Mã OTP không chính xác hoặc đã hết hạn");
    } finally {
      setIsVerifying(false);
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
            Đã nhớ mật khẩu?
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
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#eff6ff] border border-[#dbeafe] text-[10px] sm:text-[11px] font-semibold text-[#2563eb] mb-3">
                <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-pulse" />
                <span>Khôi phục tài khoản an toàn</span>
              </div>

              {/* Title */}
              <div className="space-y-1 mb-5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <span>Quên mật khẩu?</span>
                  <span className="text-xl sm:text-2xl">🔐</span>
                </h1>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Nhập email đã đăng ký. Chúng tôi sẽ gửi mã OTP 6 chữ số để xác minh danh tính của bạn.
                </p>
              </div>

              <form onSubmit={handleSubmit(handleVerifyOtp)} className="space-y-4">
                {/* EMAIL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email khôi phục
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        {...register("email")}
                        type="email"
                        placeholder="example@gmail.com"
                        autoComplete="email"
                        disabled={isVerifying}
                        className={`w-full h-10 sm:h-11 pl-10 pr-4 bg-slate-50/70 border rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100 transition ${
                          errors.email ? "border-red-500" : "border-slate-200"
                        }`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp || isVerifying}
                      className="h-10 sm:h-11 px-4 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-semibold text-xs border border-slate-200 hover:border-indigo-200 transition flex items-center gap-1.5 shrink-0 disabled:opacity-60 cursor-pointer"
                    >
                      {isSendingOtp ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send size={14} />
                          <span>{otpSent ? "Gửi lại" : "Gửi OTP"}</span>
                        </>
                      )}
                    </button>
                  </div>
                  {errors.email && (
                    <p className="text-xs font-medium text-red-500 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                  {otpSent && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-emerald-600 font-semibold">
                      <CheckCircle size={12} />
                      <span>OTP đã gửi! Kiểm tra hộp thư của bạn.</span>
                    </div>
                  )}
                </div>

                {/* OTP */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Mã xác thực OTP
                    </label>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                      <Clock size={11} />
                      <span>Hết hạn sau 60 giây</span>
                    </div>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      {...register("otp")}
                      type="text"
                      inputMode="numeric"
                      placeholder="• • • • • •"
                      maxLength={6}
                      disabled={isVerifying}
                      className={`w-full h-10 sm:h-11 pl-10 pr-4 bg-slate-50/70 border rounded-xl text-sm sm:text-base text-slate-900 tracking-[0.4em] font-bold placeholder:text-slate-300 placeholder:tracking-widest focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100 transition ${
                        errors.otp ? "border-red-500" : "border-slate-200"
                      }`}
                    />
                  </div>
                  {errors.otp && (
                    <p className="text-xs font-medium text-red-500 mt-1">
                      {errors.otp.message}
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
                    Mã hóa đầu-cuối E2EE
                  </span>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full h-10 sm:h-11 mt-1 bg-gradient-to-r from-[#4f46e5] to-[#4338ca] hover:from-[#4338ca] hover:to-[#3730a3] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-500/25 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang xác thực...</span>
                    </>
                  ) : (
                    <>
                      <span>Xác thực & Tiếp tục</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              {/* Footer link */}
              <div className="mt-4 text-center text-xs font-medium text-slate-600">
                <span>Nhớ ra mật khẩu? </span>
                <Link
                  to="/login"
                  className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition"
                >
                  Đăng nhập ngay
                </Link>
              </div>
            </div>
          </div>

          {/* ===== RIGHT: INFO PANEL ===== */}
          <div className="lg:col-span-7 hidden lg:flex flex-col gap-3.5">

            {/* Card 1: Quy trình */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <h2 className="font-bold text-sm text-slate-900">
                  Quy trình đặt lại mật khẩu an toàn
                </h2>
              </div>

              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: "Nhập email & Nhận OTP",
                    desc: "Nhập email đã đăng ký. Hệ thống tức thì tạo mã token 6 chữ số an toàn và gửi đến hòm thư ngay lập tức.",
                    active: true,
                  },
                  {
                    step: 2,
                    title: "Xác thực mã OTP 6 số",
                    desc: "Nhập mã OTP 6 chữ số vừa nhận. Mã có thời hạn bảo mật tối đa trong 60 giây trước khi cần gửi lại.",
                    active: true,
                  },
                  {
                    step: 3,
                    title: "Đặt lại mật khẩu mới",
                    desc: "Thiết lập mật khẩu mạnh mới. Zola sẽ tự động ngắt kết nối các phiên đăng nhập cũ để bảo vệ quyền riêng tư của bạn.",
                    active: false,
                  },
                ].map(({ step, title, desc, active }) => (
                  <div key={step} className="flex items-start gap-3.5">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5 ${
                        active
                          ? "bg-[#4f46e5] text-white shadow-sm shadow-indigo-300"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {step}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 mb-0.5">
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

            {/* Card 2: Bảo vệ tài khoản */}
            <div className="bg-indigo-50/60 rounded-2xl border border-indigo-100 p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 mb-1">
                  Bảo vệ tài khoản tối đa
                </h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Cam kết thông tin email không bao giờ bị lộ lọt. Hệ thống tích hợp tường lửa chống tấn công dò mật khẩu (Brute-force) với cơ chế giới hạn tần suất thông minh.
                </p>
              </div>
            </div>

            {/* Card 3 + 4 (grid) */}
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

            {/* Help row */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Gặp sự cố khi nhận email?
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Kiểm tra hộp thư Spam hoặc kết nối nhanh với chuyên viên hỗ trợ 24/7.
                  </p>
                </div>
              </div>
              <button className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 shrink-0 ml-4 cursor-pointer">
                <ShieldCheck size={13} />
                Hỗ trợ trực tiếp
              </button>
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

export default ForgotPass;