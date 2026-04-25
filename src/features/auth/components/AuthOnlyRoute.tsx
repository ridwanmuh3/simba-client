import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../context";
import Spinner from "@/components/shared/Spinner";

const AuthOnlyRoute = () => {
  const location = useLocation();
  const { user, isLoading } = useAuth();

  if (isLoading) return <Spinner />;

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default AuthOnlyRoute;
