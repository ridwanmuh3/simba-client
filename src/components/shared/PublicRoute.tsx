import { useAuth } from "@/hooks/use-auth";
import Spinner from "./Spinner";
import { Navigate, Outlet } from "react-router";

const PublicRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Spinner />;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
