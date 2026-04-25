import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../context";
import Spinner from "@/components/shared/Spinner";
import { UserRole } from "@/features/users/types";

type ProtectedRouteProps = {
  allowedRoles: UserRole[];
};

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const { user, isLoading, hasDapur } = useAuth();

  if (isLoading) return <Spinner />;

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!hasDapur) {
    return <Navigate to="/select-dapur" replace />;
  }

  const isAllowed = allowedRoles.length === 0 || allowedRoles.includes(user.role);

  if (!isAllowed) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
