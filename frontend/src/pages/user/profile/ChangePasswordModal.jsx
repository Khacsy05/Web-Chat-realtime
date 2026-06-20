import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import auth from "@/service/auth";
import { toast } from "sonner";
import { KeyRound, Eye, EyeOff } from "lucide-react";

const schema = yup.object().shape({
  oldPassword: yup
    .string()
    .required("Vui lòng nhập mật khẩu hiện tại"),
  newPassword: yup
    .string()
    .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự")
    .required("Vui lòng nhập mật khẩu mới"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword"), null], "Mật khẩu xác nhận không trùng khớp")
    .required("Vui lòng xác nhận mật khẩu mới"),
});

const ChangePasswordModal = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await auth.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      toast.success("Đổi mật khẩu thành công!");
      reset();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      const msg = error.data?.message || "Đổi mật khẩu thất bại. Vui lòng thử lại!";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-slate-800">
      <div className="flex flex-col items-center gap-2 pb-2 border-b border-gray-100">
        <div className="w-12 h-12 rounded-full bg-indigo-50 text-[#5c60c0] flex items-center justify-center">
          <KeyRound size={24} />
        </div>
        <p className="text-xs text-gray-500 text-center">
          Hãy thiết lập mật khẩu mới có ít nhất 6 ký tự để bảo mật tài khoản tốt hơn.
        </p>
      </div>

      {/* Mật khẩu cũ */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-600 block">Mật khẩu hiện tại</label>
        <div className="relative">
          <input
            type={showOldPass ? "text" : "password"}
            {...register("oldPassword")}
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-[#5c60c0] transition-colors pr-10"
            placeholder="Nhập mật khẩu hiện tại"
          />
          <button
            type="button"
            onClick={() => setShowOldPass(!showOldPass)}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            {showOldPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.oldPassword && (
          <p className="text-red-500 text-xs mt-0.5">{errors.oldPassword.message}</p>
        )}
      </div>

      {/* Mật khẩu mới */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-600 block">Mật khẩu mới</label>
        <div className="relative">
          <input
            type={showNewPass ? "text" : "password"}
            {...register("newPassword")}
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-[#5c60c0] transition-colors pr-10"
            placeholder="Nhập mật khẩu mới"
          />
          <button
            type="button"
            onClick={() => setShowNewPass(!showNewPass)}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.newPassword && (
          <p className="text-red-500 text-xs mt-0.5">{errors.newPassword.message}</p>
        )}
      </div>

      {/* Xác nhận mật khẩu mới */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-600 block">Xác nhận mật khẩu mới</label>
        <div className="relative">
          <input
            type={showConfirmPass ? "text" : "password"}
            {...register("confirmPassword")}
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-[#5c60c0] transition-colors pr-10"
            placeholder="Nhập lại mật khẩu mới"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPass(!showConfirmPass)}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 text-xs mt-0.5">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
        >
          Hủy bỏ
        </button>
        <Button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[#5c60c0] text-white px-5 py-2 text-sm font-medium hover:bg-[#4b4fad] transition-colors"
        >
          {loading ? "Đang lưu..." : "Xác nhận"}
        </Button>
      </div>
    </form>
  );
};

export default ChangePasswordModal;
