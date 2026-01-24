import {
  useMemo,
  useState,
  type PropsWithChildren,
  useEffect,
  useCallback,
} from "react";
import { useLocation, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useLoginMutation, useLogoutMutation } from "@/api/auth";
import { AuthUser, UserLoginRequest } from "@/types/auth";
import { isAxiosError } from "axios";
import { axiosInstance } from "@/lib/axios";
import { AuthContext } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import Spinner from "./Spinner";
import { PUBLIC_ROUTES } from "./constants";
import { queryClient } from "@/lib/react-query";

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  const handleRedirect = useCallback(
    (userData: AuthUser, path: string) => {
      if (["Admin", "Super Admin"].includes(userData.role)) {
        navigate(path, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    },
    [navigate],
  );

  const login = useCallback(
    async (request: UserLoginRequest, onError?: (msg: string) => void) => {
      try {
        setIsLoading(true);

        await loginMutation.mutateAsync(request);

        const freshUser = await queryClient.fetchQuery({
          queryKey: ["authUser"],
          queryFn: async () => {
            const response = await axiosInstance.get("/auth/_current");
            return response.data.data as AuthUser;
          },
          staleTime: 0,
        });

        if (freshUser) {
          setAuthUser(freshUser);
          toast({
            title: "Login berhasil!",
            description: "Selamat datang kembali.",
          });

          handleRedirect(freshUser, "/dashboard");
        }
      } catch (e) {
        let msg = "Terjadi kesalahan saat login";
        if (isAxiosError(e)) {
          switch (e.status) {
            case 400:
              msg = "Username atau password salah";
              break;
            case 401:
              msg = "Username atau password salah";
              break;
            case 404:
              msg = "Akun pengguna tidak ditemukan";
              break;
            case 500:
              msg = "Terjadi kesalahan di server";
              break;
          }
        }

        if (onError) onError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [loginMutation, queryClient, handleRedirect],
  );

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await logoutMutation.mutateAsync();
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      setAuthUser(null);
      queryClient.setQueryData(["authUser"], null);
      queryClient.removeQueries({ queryKey: ["authUser"] });
      setIsLoading(false);
      navigate("/", { replace: true });
    }
  }, [logoutMutation, queryClient, navigate]);

  const value = useMemo(
    () => ({
      user: authUser,
      isLoading,
      isAuthenticated: !!authUser,
      login,
      logout,
    }),
    [authUser, isLoading, login, logout],
  );

  useEffect(() => {
    const getAuthInitialState = async () => {
      if (PUBLIC_ROUTES.includes(location.pathname)) {
        setIsInitialized(true);
        return;
      }

      try {
        const freshUser = await queryClient.fetchQuery({
          queryKey: ["authUser"],
          queryFn: async () => {
            const response = await axiosInstance.get("/auth/_current");
            return response.data.data as AuthUser;
          },
          staleTime: 0,
        });

        if (freshUser) {
          setAuthUser(freshUser);
        } else {
          navigate("/", { replace: true });
        }
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 401) {
          navigate("/", { replace: true });
        } else {
          console.error("Auth initialization failed:", error);
          toast({
            variant: "destructive",
            title: "Gagal memuat sesi",
            description: "Terjadi kesalahan saat memuat data autentikasi.",
          });
          navigate("/", { replace: true });
        }
      } finally {
        setIsInitialized(true);
      }
    };

    getAuthInitialState();
  }, [queryClient, location.pathname, navigate]);

  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (isAxiosError(error) && error.response?.status === 401) {
          if (!PUBLIC_ROUTES.includes(location.pathname)) {
            setAuthUser(null);
            queryClient.setQueryData(["authUser"], null);
            queryClient.removeQueries({ queryKey: ["authUser"] });

            toast({
              variant: "destructive",
              title: "Sesi login anda habis",
              description: "Silakan login kembali untuk mengakses sistem.",
            });

            navigate("/", { replace: true });
          }
        }
        return Promise.reject(error);
      },
    );

    return () => {
      axiosInstance.interceptors.response.eject(interceptor);
    };
  }, [navigate, queryClient, location.pathname]);

  if (!isInitialized) {
    return <Spinner />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
