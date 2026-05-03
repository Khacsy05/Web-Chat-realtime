import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import auth from '@/service/auth';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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

const EMPTY_FORM = {
    email: "",
    otp: "",
};

const ForgotPass = () => {
    const {
        register,
        handleSubmit,
         trigger,
         getValues,
        formState: {errors}
    } = useForm({
        resolver: yupResolver(authSchema),
        mode: "onSubmit",
        defaultValues: EMPTY_FORM
    });
    const navigate = useNavigate();
    const onSubmit = (data) => {
        console.log(data);
        
    };

    const handleVerifyOtp = async (data) => {
        try {
            const res = await auth.verifyOtp(data)

            const resetToken = res.data.resetToken;
            toast.success("Xac thuc thanh cong");
            console.log(resetToken)
            navigate("/resetPassword?token=" + resetToken)
        } catch (error) {
            toast.error("OTP khong chinh xac");
        }
    }

    const handleSendOtp = async (data) => {
        const isValid = await trigger("email")

        if (!isValid) return

        try {
            const email = getValues("email");
            const res = await auth.sendOtp({email})
            toast.success("OTP đã gửi về email");
        } catch (error) {
            toast.error("Gửi OTP thất bại");
        }
       
    }
  return (
    <div>
        <span className='justify-center flex text-[30px]'>Quen mat khau</span>
        <div className='items-center justify-center flex flex-col sm:flex-row '>
            <Card className="p-[25px] m-[50px] w-[500px]">
                <form
                    onSubmit={handleSubmit(handleVerifyOtp)}
                    className="space-y-4"
                >

                {/* EMAIL */}
                <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">
                    Email:
                    </label>

                    <div>
                    <Input
                        {...register("email")}
                        className="h-10"
                        placeholder="Nhập email"
                    />

                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                        {errors.email.message}
                        </p>
                    )}
                    </div>
                </div>

                {/* OTP */}
                <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">
                        OTP:
                    </label>

                    <div className="flex gap-2">
                    <div className="flex-1">
                        <Input
                            {...register("otp")}
                            className="h-10"
                            placeholder="6 số OTP"
                            maxLength={6}
                        />

                        {errors.otp && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.otp.message}
                        </p>
                        )}
                    </div>

                    <Button type="button" onClick={handleSendOtp}>
                     Gửi OTP
                    </Button>
                    </div>
                </div>

                {/* ACTION */}
                <div className="flex justify-end gap-3">
                    <Button type="button"
                        onClick = {() => (navigate("/login"))}
                    >
                    Hủy
                    </Button>

                    <Button type="submit"
                        
                    >
                    OK
                    </Button>
                </div>

                </form>
            </Card>    
        </div>
    </div>
  )
}

export default ForgotPass
