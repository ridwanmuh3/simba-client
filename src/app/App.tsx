import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router";
import { queryClient } from "@/lib/react-query";
import Protected from "@/components/Protected";
import { AuthProvider } from "@/components/AuthProvider";
import { lazy, Suspense } from "react";
import Spinner from "@/components/Spinner";

const Login = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Items = lazy(() => import("@/pages/Items"));
const Users = lazy(() => import("@/pages/Users"));
const Finance = lazy(() => import("@/pages/Finance"));
const ErrorPage = lazy(() => import("@/pages/Error"));

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route index path="/" element={<Login />} />
              <Route
                element={<Protected allowedRoles={["Admin", "Super Admin"]} />}
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/items" element={<Items />} />
                <Route path="/finance" element={<Finance />} />
              </Route>
              <Route element={<Protected allowedRoles={["Super Admin"]} />}>
                <Route path="/users" element={<Users />} />
              </Route>
              <Route
                path="*"
                element={
                  <ErrorPage code={404} message="Halaman tidak ditemukan" />
                }
              />
              <Route
                path="/forbidden"
                element={
                  <ErrorPage
                    code={403}
                    message="Anda tidak diizinkan mengakses halaman ini"
                  />
                }
              />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
