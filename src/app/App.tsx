import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router";
import { queryClient } from "@/core/query/client";
import ProtectedRoute from "@/features/auth/components/ProtectedRoute";
import AuthOnlyRoute from "@/features/auth/components/AuthOnlyRoute";
import { AuthProvider } from "@/features/auth/components/AuthProvider";
import { lazy, Suspense } from "react";
import Spinner from "@/components/shared/Spinner";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { UserRole } from "@/features/users/types";
import PublicRoute from "@/features/auth/components/PublicRoute";

const Login = lazy(() => import("@/pages/Login"));
const SelectDapur = lazy(() => import("@/pages/SelectDapur"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Items = lazy(() => import("@/pages/Items"));
const Users = lazy(() => import("@/pages/Users"));
const Finance = lazy(() => import("@/pages/Finance"));
const DapurManagement = lazy(() => import("@/pages/DapurManagement"));
const ErrorPage = lazy(() => import("@/pages/Error"));

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route element={<PublicRoute />}>
                <Route path="/" element={<Login />} />
              </Route>
              <Route element={<AuthOnlyRoute />}>
                <Route path="/select-dapur" element={<SelectDapur />} />
              </Route>
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}
                  />
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/items" element={<Items />} />
                <Route path="/finance" element={<Finance />} />
              </Route>

              <Route
                element={
                  <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]} />
                }
              >
                <Route path="/users" element={<Users />} />
                <Route path="/dapurs" element={<DapurManagement />} />
              </Route>

              <Route
                path="/forbidden"
                element={
                  <ErrorPage
                    code={403}
                    message="Anda tidak diizinkan mengakses halaman ini"
                  />
                }
              />
              <Route
                path="*"
                element={
                  <ErrorPage code={404} message="Halaman tidak ditemukan" />
                }
              />
            </Routes>
          </Suspense>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
