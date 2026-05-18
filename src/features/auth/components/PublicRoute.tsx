import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context";

const PublicRoute = () => {
  const { isAuthenticated, hasDapur } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={hasDapur ? "/dashboard" : "/select-dapur"} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
