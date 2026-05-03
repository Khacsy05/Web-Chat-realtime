import useAuthStore from "@/stores/useAuthStore";
import { Navigate, Outlet } from "react-router-dom";
export function ProtectedRoute({allowedRoles}){
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const role = useAuthStore((state) => state.role);
    if(!isAuthenticated){
        return <Navigate to = "/login" replace/>
    }
    if(allowedRoles && !allowedRoles.includes(role)){
        return <Navigate to="/unauthorized" replace />;
    }
    return <Outlet />;
}