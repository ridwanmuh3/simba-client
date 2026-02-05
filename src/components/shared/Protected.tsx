import { Navigate, Outlet, useLocation } from "react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Spinner from "./Spinner";

type ProtectedRouteProps = {
  allowedRoles: string[];
};

const Protected = ({ allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Spinner />;
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
};

export default Protected;
