import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "../store/userStore";

const ProtectedRoute = () => {
    const { isAuthenticated } = useUserStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
