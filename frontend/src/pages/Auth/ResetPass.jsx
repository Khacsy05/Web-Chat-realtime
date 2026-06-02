import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import auth from '@/service/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';

const authSchema = yup.object().shape({
    password: yup.string().required("Vui lòng nhập mật khẩu mới").min(6, "Mật khẩu ít nhất 6 ký tự"),
    confirmPassword: yup
        .string()
        .required("Vui lòng xác nhận mật khẩu")
        .oneOf([yup.ref("password")], "Mật khẩu xác nhận không khớp")
});

const ResetPass = () => {
    const [showPass, setShowPass] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(authSchema),
        mode: "onSubmit",
    });

    const location = useLocation();
    const token = new URLSearchParams(location.search).get("token");
    const navigate = useNavigate();

    const handleResetPass = async (data) => {
        if (!token) {
            toast.error("Token không hợp lệ hoặc đã hết hạn");
            return;
        }
        setIsSubmitting(true);
        try {
            await auth.ResetPass({
                token,
                newPassword: data.password,
            });
            toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
            navigate("/login");
        } catch (error) {
            toast.error("Yêu cầu quá hạn hoặc lỗi hệ thống");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-[#f4f5f7] p-4">
            <Card className="w-full max-w-[450px] shadow-xl border-gray-100 rounded-2xl bg-white overflow-hidden">
                <CardHeader className="space-y-1 text-center pt-8">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <CheckCircle2 size={28} />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Đặt lại mật khẩu</CardTitle>
                    <CardDescription className="text-gray-500">
                        Tạo mật khẩu mới mạnh mẽ hơn để bảo vệ tài khoản
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                    <form onSubmit={handleSubmit(handleResetPass)} className="space-y-5">
                        {/* NEW PASSWORD */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Mật khẩu mới</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    {...register("password")}
                                    type={showPass ? "text" : "password"}
                                    className={`pl-10 pr-10 h-11 bg-gray-50 ${errors.password ? 'border-red-500' : ''}`}
                                    placeholder="Nhập mật khẩu mới"
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowPass(!showPass)}
                                >
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Xác nhận mật khẩu</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    {...register("confirmPassword")}
                                    type={showPass ? "text" : "password"}
                                    className={`pl-10 h-11 bg-gray-50 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                    placeholder="Nhập lại mật khẩu"
                                    disabled={isSubmitting}
                                />
                            </div>
                            {errors.confirmPassword && <p className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>}
                        </div>

                        <Button 
                            type="submit" 
                            className="h-11 w-full bg-[#0561ff] hover:bg-[#0052db] font-bold shadow-md transition-all mt-2"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Đang cập nhật...</span>
                                </div>
                            ) : "Xác nhận đổi mật khẩu"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default ResetPass