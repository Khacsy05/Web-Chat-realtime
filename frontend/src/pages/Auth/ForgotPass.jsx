import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import auth from '@/service/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';

const authSchema = yup.object().shape({
    email: yup.string().required("Vui lòng nhập email").email("Email không hợp lệ"),
    otp: yup.string().required("Vui lòng nhập OTP").matches(/^\d{6}$/, "OTP phải gồm đúng 6 chữ số"),
});

const ForgotPass = () => {
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    
    const { register, handleSubmit, trigger, getValues, formState: { errors } } = useForm({
        resolver: yupResolver(authSchema),
        mode: "onSubmit",
        defaultValues: { email: "", otp: "" }
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
        <div className="flex min-h-screen w-full items-center justify-center bg-[#f4f5f7] p-4">
            <Card className="w-full max-w-[450px] shadow-xl border-gray-100 rounded-2xl bg-white overflow-hidden animate-fade-in">
                <CardHeader className="space-y-1 text-center pt-8">
                    <CardTitle className="text-2xl font-bold text-gray-900">Quên mật khẩu?</CardTitle>
                    <CardDescription className="text-gray-500">
                        Nhập email để nhận mã xác thực OTP
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                    <form onSubmit={handleSubmit(handleVerifyOtp)} className="space-y-5">
                        {/* EMAIL FIELD */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Email khôi phục</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    {...register("email")}
                                    className={`pl-10 h-11 bg-gray-50 ${errors.email ? 'border-red-500' : ''}`}
                                    placeholder="example@gmail.com"
                                    disabled={isVerifying}
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
                        </div>

                        {/* OTP FIELD */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Mã xác thực OTP</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        {...register("otp")}
                                        className={`pl-10 h-11 bg-gray-50 tracking-[0.5em] font-bold ${errors.otp ? 'border-red-500' : ''}`}
                                        placeholder="000000"
                                        maxLength={6}
                                        disabled={isVerifying}
                                    />
                                </div>
                                <Button 
                                    type="button" 
                                    variant="secondary"
                                    className="h-11 px-4 font-semibold hover:bg-gray-200 transition-colors"
                                    onClick={handleSendOtp}
                                    disabled={isSendingOtp || isVerifying}
                                >
                                    {isSendingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gửi OTP"}
                                </Button>
                            </div>
                            {errors.otp && <p className="text-xs text-red-500 font-medium">{errors.otp.message}</p>}
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                            <Button 
                                type="submit" 
                                className="h-11 w-full bg-[#0561ff] hover:bg-[#0052db] font-bold shadow-md transition-all"
                                disabled={isVerifying}
                            >
                                {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Tiếp tục"}
                            </Button>
                            
                            <Button 
                                type="button" 
                                variant="ghost" 
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => navigate("/login")}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại đăng nhập
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default ForgotPass