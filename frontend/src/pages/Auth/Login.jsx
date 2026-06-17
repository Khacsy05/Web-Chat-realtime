import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import auth from '@/service/auth';
import useAuthStore from '@/stores/useAuthStore';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, User, Loader2 } from 'lucide-react'; // 🌟 Thêm các icon đẹp
import socket from '@/lib/socket';

const authSchema = yup.object().shape({
    username: yup.string().required("Vui lòng nhập tên tài khoản"),
    password: yup.string().required("Vui lòng nhập mật khẩu")
});

const EMPTY_FORM = {
    username: "",
    password: "",
};

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(authSchema),
        mode: "onSubmit",
        defaultValues: EMPTY_FORM
    });

    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth)

    const handleLogin = async (data) => {
        setIsLoading(true);
        try {
            const respone = await auth.login(data);
            setAuth(respone.data.user, respone.data.token)
            toast.success("Đăng nhập thành công 🎉")
            socket.emit("join", String(respone.data.user.idUser));
            navigate('/')
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
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-[#f4f5f7] p-4 select-none">
            <Card className="w-full max-w-[450px] shadow-xl border-gray-100 bg-white rounded-2xl overflow-hidden animate-fade-in">
                {/* Header Đăng nhập thiết kế lại hoành tráng hơn */}
                <CardHeader className="space-y-1 text-center pt-8 pb-4">
                    <CardTitle className="text-3xl font-bold tracking-tight text-gray-900">
                        Chào mừng trở lại
                    </CardTitle>
                    <CardDescription className="text-gray-500 text-sm">
                        Vui lòng đăng nhập để kết nối với bạn bè
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                    <form onSubmit={handleSubmit(handleLogin)} className="space-y-5">

                        {/* 1. Trường Username */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Tên đăng nhập</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
                                <Input
                                    {...register("username")}
                                    type="text"
                                    placeholder="Nhập username của bạn..."
                                    className={`h-11 pl-10 bg-gray-50/50 focus:bg-white transition-all rounded-lg ${errors.username ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.username && (
                                <p className="text-xs font-medium text-red-500 animate-slide-in">{errors.username.message}</p>
                            )}
                        </div>

                        {/* 2. Trường Password */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Mật khẩu</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
                                <Input
                                    {...register("password")}
                                    type={showPassword ? "text" : "password"} // Ẩn hiện ký tự mật khẩu
                                    placeholder="••••••••"
                                    className={`h-11 pl-10 pr-10 bg-gray-50/50 focus:bg-white transition-all rounded-lg ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                    disabled={isLoading}
                                />
                                {/* Nút bật/tắt con mắt mật khẩu */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs font-medium text-red-500 animate-slide-in">{errors.password.message}</p>
                            )}
                        </div>

                        {/* 3. Link Đăng ký / Quên mật khẩu */}
                        <div className="flex items-center justify-between text-xs font-medium pt-1">
                            <Link to="/register" className="text-[#0561ff] hover:underline">
                                Chưa có tài khoản? Đăng ký
                            </Link>
                            <Link to="/forgotPassword" className="text-gray-500 hover:text-gray-800 transition-colors">
                                Quên mật khẩu?
                            </Link>
                        </div>

                        {/* 4. Khối nút bấm Action */}
                        <div className="flex items-center gap-3 pt-2">

                            <Button
                                type="submit"
                                className="h-11 flex-1 rounded-lg bg-[#0561ff] font-semibold text-white hover:bg-[#0052db] transition shadow-md disabled:opacity-70"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Đang xử lý...</span>
                                    </div>
                                ) : (
                                    "Đăng nhập"
                                )}
                            </Button>
                        </div>

                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default Login