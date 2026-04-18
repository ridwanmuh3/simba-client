import { useMemo, type PropsWithChildren, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  useCurrentAuth,
  useLoginMutation,
  useLogoutMutation,
} from "@/api/auth";
import { UserLoginRequest } from "@/types/auth";
import { isAxiosError } from "axios";
import { axiosInstance } from "@/lib/axios";
import { AuthContext } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import Spinner from "./Spinner";
import { queryClient } from "@/lib/react-query";

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isPublicRoute = location.pathname === "/";

  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();
  const { data: user, isLoading } = useCurrentAuth(!isPublicRoute);

  const login = useCallback(
    async (request: UserLoginRequest, onError?: (msg: string) => void) => {
      try {
        await loginMutation.mutateAsync(request);

        toast({
          title: "Login berhasil!",
          description: "Selamat datang kembali.",
        });
        navigate("/dashboard", { replace: true });
      } catch (e) {
        let msg =
          "Login gagal. Periksa koneksi internet Anda dan coba lagi.";
        if (isAxiosError(e)) {
          const status = e.response?.status;
          if (status === 400 || status === 401) {
            msg =
              "Username atau password yang Anda masukkan salah. Silakan periksa kembali.";
          } else if (status === 404) {
            msg =
              "Akun dengan username tersebut tidak terdaftar. Pastikan username benar atau hubungi admin.";
          } else if (status === 429) {
            msg =
              "Terlalu banyak percobaan login. Tunggu beberapa saat lalu coba lagi.";
          } else if (status && status >= 500) {
            msg =
              "Server sedang bermasalah. Silakan coba lagi dalam beberapa saat.";
          }
        }

        onError?.(msg);
      }
    },
    [loginMutation, navigate],
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      toast({
        variant: "destructive",
        title: "Gagal logout",
        description:
          "Tidak dapat terhubung ke server untuk logout. Sesi Anda akan dibersihkan secara lokal.",
      });
    } finally {
      queryClient.removeQueries({ queryKey: ["authUser"] });
      navigate("/", { replace: true });
    }
  }, [logoutMutation, queryClient, navigate]);

  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (isAxiosError(error) && error.response?.status === 401) {
          if (window.location.pathname !== "/") {
            queryClient.removeQueries({ queryKey: ["authUser"] });
            navigate("/", { replace: true });
          }
        }
        return Promise.reject(error);
      },
    );

    return () => {
      axiosInstance.interceptors.response.eject(interceptor);
    };
  }, [navigate, queryClient]);

  const value = useMemo(
    () => ({
      user: user ?? null,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  );

  if (isLoading) {
    return <Spinner />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
