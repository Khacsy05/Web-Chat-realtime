import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import React from 'react'
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import auth from '@/service/auth';
import useAuthStore from '@/stores/useAuthStore';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const authSchema = yup.object().shape({
    password: yup.string().required("Vui lòng nhập password"),
    confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Mật khẩu không khớp")
});

const EMPTY_FORM = {
    password: "",
};

const ResetPass = () => {
    const {
        register,
        handleSubmit,
        formState: {errors}
    } = useForm({
        resolver: yupResolver(authSchema),
        mode: "onSubmit",
        defaultValues: EMPTY_FORM
    });

    const location = useLocation();
    const token = new URLSearchParams(location.search).get("token");

    const navigate = useNavigate();
    const onSubmit = (data) => {
        console.log(data);
        navigate("/login")
    };
    const setAuth = useAuthStore((state) => state.setAuth)
    const handleResetPass = async (data) => {
        try {
            const res = await auth.ResetPass({
                token,
                newPassword: data.password,
            });
            toast.success("Đổi mật khẩu thành công");
            navigate("/login");
            console.log(res)
        } catch (error) {
            toast.error("Đổi mật khẩu thất bại");
        }
    }

    
  return (
    <div>
        <span className='justify-center flex text-[30px]'>Dat lai mat khau</span>
        <div className='items-center justify-center flex flex-col sm:flex-row '>
            <Card className="p-[25px] m-[50px] w-[500px]">
                <form action=""onSubmit={handleSubmit(handleResetPass)} className='space-y-4'>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                        <label className='flex-shrink-0 text-sm font-medium text-gray-700'>Password moi: </label>
                        <Input
                            {...register("password")}
                            className = "h-10"></Input>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                        <label className=' text-sm font-medium text-gray-700'>Nhap lai password: </label>
                        <Input 
                            {...register("confirmPassword")}
                            className = "h-10"/>
                            
                    </div>
                    
                    <div className='flex justify-end gap-3'>
                        <Button type = "button"
                            onClick = {() => (navigate("/login"))}
                        >Huy</Button>
                        <Button type = "submit">Ok</Button>

                    </div>
                </form>
            </Card>    
        </div>
    </div>
  )
}

export default ResetPass
