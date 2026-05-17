import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import React from 'react'
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import auth from '@/service/auth';
import useAuthStore from '@/stores/useAuthStore';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const authSchema = yup.object().shape({
    username: yup.string().required("vui long nhap username"),
    password: yup.string().required("vui long nhap password")
});

const EMPTY_FORM = {
    username: "",
    password: "",
};

const Login = () => {
    const {
        register,
        handleSubmit,
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
    const setAuth = useAuthStore((state) => state.setAuth)
    const handleLogin = async (data) => {
        try {
            const respone = await auth.login(data);
            setAuth(respone.data.user,respone.data.token)
            toast.success("Dang nhap thanh cong")
            navigate('/')
            console.log(respone)    

        } catch (error) {
            console.error("Login failed:", error);
            const backendMessage =
              error?.data?.message ||
              error?.response?.data?.message ||
              "Dang nhap that bai";
            toast.error(backendMessage);
        }
    }
  return (  
    <div>
        <span className='justify-center flex text-[30px]'>Dang nhap</span>
        <div className='items-center justify-center flex flex-col sm:flex-row '>
            <Card className="p-[25px] m-[50px] w-[500px]">
                <form action=""onSubmit={handleSubmit(handleLogin)} className='space-y-4'>
                    <div className='flex items-center gap-10'>
                        <label className='w-35 flex-shrink-0 text-sm font-medium text-gray-700'>Username: </label>
                        <Input
                            {...register("username")}
                            className = "h-10"></Input>
                    </div>
                    <div className='flex items-center gap-10'>
                        <label className='w-35 flex-shrink-0 text-sm font-medium text-gray-700'>Password: </label>
                        <Input 
                            {...register("password")}
                            className = "h-10"/>
                            {errors.password && <p className="text-red-500">{errors.password.message}</p>}
                    </div>
                    <div className='flex justify-end'>
                        <Link>Dang ky</Link>
                        <Link to={"/forgotPassword"}>Quen mat khau</Link>
                    </div>
                    <div className='flex justify-end gap-3'>
                        <Button type = "button">Huy</Button>
                        <Button type = "submit">Ok</Button>

                    </div>
                </form>
            </Card>    
        </div>
    </div>
  )
}

export default Login
