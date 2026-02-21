import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import Spinner from "./Spinner";
import { UserRole } from "@/types/user";

type ProtectedRouteProps = {
  allowedRoles: UserRole[];
};

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const { user, isLoading } = useAuth();

  if (isLoading) return <Spinner />;

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  const isAllowed =
    allowedRoles.length === 0 || allowedRoles.includes(user.role);

  if (!isAllowed) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
