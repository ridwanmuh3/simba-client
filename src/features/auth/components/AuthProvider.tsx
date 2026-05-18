import { useMemo, type PropsWithChildren, useCallback, startTransition } from "react";
import { useLocation, useNavigate } from "react-router";
import { useCurrentAuth, useHeartbeat, useLoginMutation, useLogoutMutation } from "../api";
import { UserLoginRequest } from "../types";
import { isAxiosError } from "axios";
import { AuthContext } from "../context";
import { toast } from "@/hooks/use-toast";
import Spinner from "@/components/shared/Spinner";
import { queryClient } from "@/core/query/client";
import { queryKeys } from "@/core/query/keys";

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isPublicRoute = location.pathname === "/";

  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();
  const { data: user, isLoading } = useCurrentAuth(!isPublicRoute);
  useHeartbeat(!!user);

  // Only block the tree on initial fetch when we have no data at all.
  // Prevents spinner flash when navigating after login (cache already warm).
  const showSpinner = isLoading && user === undefined;

  const login = useCallback(
    async (request: UserLoginRequest, onError?: (msg: string) => void) => {
      try {
        await loginMutation.mutateAsync(request);
        toast({ title: "Login berhasil!", description: "Selamat datang kembali." });
        startTransition(() => {
          navigate("/select-dapur", { replace: true });
        });
      } catch (e) {
        let msg = "Login gagal. Periksa koneksi internet Anda dan coba lagi.";
        if (isAxiosError(e)) {
          const status = e.response?.status;
          if (status === 400 || status === 401) {
            msg = "Username atau password yang Anda masukkan salah. Silakan periksa kembali.";
          } else if (status === 404) {
            msg = "Akun dengan username tersebut tidak terdaftar. Pastikan username benar atau hubungi admin.";
          } else if (status === 429) {
            msg = "Terlalu banyak percobaan login. Tunggu beberapa saat lalu coba lagi.";
          } else if (status && status >= 500) {
            msg = "Server sedang bermasalah. Silakan coba lagi dalam beberapa saat.";
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
      // Server logout failed (e.g. expired token), but finally always cleans up locally
    } finally {
      queryClient.removeQueries({ queryKey: queryKeys.auth.current });
      navigate("/", { replace: true });
    }
  }, [logoutMutation, navigate]);

  const value = useMemo(
    () => ({
      user: user ?? null,
      isLoading,
      isAuthenticated: !!user,
      hasDapur: !!(user?.currentDapurId),
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  );

  if (showSpinner) return <Spinner />;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
