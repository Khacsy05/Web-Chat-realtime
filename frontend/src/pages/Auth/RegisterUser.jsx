import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import auth from '@/service/auth';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, User, Mail, UserCheck, Loader2 } from 'lucide-react';

// Cấu hình validate với bộ thông báo tiếng Việt trực quan
const registerSchema = yup.object().shape({
    username: yup.string().required("Vui lòng nhập tên tài khoản").min(3, "Tài khoản phải từ 3 ký tự"),
    fullname: yup.string().required("Vui lòng nhập họ và tên"),
    email: yup.string().required("Vui lòng nhập email").email("Email không đúng định dạng"),
    password: yup.string().required("Vui lòng nhập mật khẩu").min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: yup
        .string()
        .required("Vui lòng xác nhận mật khẩu")
        .oneOf([yup.ref("password")], "Mật khẩu xác nhận không khớp")
});

const EMPTY_FORM = {
    username: "",
    fullname: "",
    email: "",
    password: "",
    confirmPassword: ""
};

const RegisterUser = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(registerSchema),
        mode: "onSubmit",
        defaultValues: EMPTY_FORM
    });

    const handleRegister = async (data) => {
        setIsLoading(true);
        try {
            // Lọc bỏ bớt confirmPassword trước khi gửi lên Backend nếu API không cần
            const { confirmPassword, ...registerData } = data;
            
            await auth.register(registerData); 
            toast.success("Đăng ký tài khoản thành công! 🎉");
            navigate('/login'); // Đăng ký xong đá sang trang login luôn
        } catch (error) {
            console.error("Register failed:", error);
            const backendMessage =
              error?.data?.message ||
              error?.response?.data?.message ||
              "Đăng ký thất bại, tài khoản hoặc email đã tồn tại";
            toast.error(backendMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-[#f4f5f7] p-4 select-none">
            <Card className="w-full max-w-[480px] shadow-xl border-gray-100 bg-white rounded-2xl overflow-hidden animate-fade-in my-8">
                
                <CardHeader className="space-y-1 text-center pt-8 ">
                    <CardTitle className="text-3xl font-bold tracking-tight text-gray-900">
                        Tạo tài khoản mới
                    </CardTitle>
                    <CardDescription className="text-gray-500 text-sm">
                        Kết nối và trò chuyện cùng bạn bè ngay hôm nay
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                    <form onSubmit={handleSubmit(handleRegister)} className="space-y-1">
                        
                        {/* 1. Username */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Tên đăng nhập (Username)</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
                                <Input
                                    {...register("username")}
                                    placeholder="Ví dụ: nguyenvana"
                                    className={`h-11 pl-10 bg-gray-50/50 ${errors.username ? 'border-red-500' : ''}`}
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.username && <p className="text-xs font-medium text-red-500">{errors.username.message}</p>}
                        </div>

                        {/* 2. Fullname */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Họ và tên hiển thị</label>
                            <div className="relative">
                                <UserCheck className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
                                <Input
                                    {...register("fullname")}
                                    placeholder="Ví dụ: Nguyễn Văn A"
                                    className={`h-11 pl-10 bg-gray-50/50 ${errors.fullname ? 'border-red-500' : ''}`}
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.fullname && <p className="text-xs font-medium text-red-500">{errors.fullname.message}</p>}
                        </div>

                        {/* 3. Email */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Địa chỉ Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
                                <Input
                                    {...register("email")}
                                    type="email"
                                    placeholder="nguyenvana@gmail.com"
                                    className={`h-11 pl-10 bg-gray-50/50 ${errors.email ? 'border-red-500' : ''}`}
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.email && <p className="text-xs font-medium text-red-500">{errors.email.message}</p>}
                        </div>

                        {/* 4. Password */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Mật khẩu</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
                                <Input 
                                    {...register("password")}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Tối thiểu 6 ký tự"
                                    className={`h-11 pl-10 pr-10 bg-gray-50/50 ${errors.password ? 'border-red-500' : ''}`}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs font-medium text-red-500">{errors.password.message}</p>}
                        </div>

                        {/* 5. Confirm Password */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Nhập lại mật khẩu</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
                                <Input 
                                    {...register("confirmPassword")}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Xác nhận lại mật khẩu..."
                                    className={`h-11 pl-10 bg-gray-50/50 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.confirmPassword && <p className="text-xs font-medium text-red-500">{errors.confirmPassword.message}</p>}
                        </div>

                        {/* Điều hướng nhanh sang Login */}
                        <div className="text-center text-xs font-medium pt-1">
                            <span className="text-gray-500">Đã có tài khoản? </span>
                            <Link to="/login" className="text-[#0561ff] hover:underline font-semibold">
                                Đăng nhập ngay
                            </Link>
                        </div>

                        {/* Khối nút thao tác */}
                        <div className="flex items-center gap-3 pt-3">
                            <Button 
                                type="button" 
                                variant="outline"
                                className="h-11 flex-1 rounded-lg border-gray-300 font-semibold text-gray-700 hover:bg-gray-50"
                                onClick={() => navigate('/login')}
                                disabled={isLoading}
                            >
                                Hủy
                            </Button>
                            <Button 
                                type="submit"
                                className="h-11 flex-1 rounded-lg bg-[#0561ff] font-semibold text-white hover:bg-[#0052db] transition shadow-md"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Đang tạo tài khoản...</span>
                                    </div>
                                ) : (
                                    "Đăng ký"
                                )}
                            </Button>
                        </div>

                    </form>
                </CardContent>
            </Card>  
        </div>
    )
}

export default RegisterUser