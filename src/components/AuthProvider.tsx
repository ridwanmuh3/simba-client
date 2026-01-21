import { useMemo, useState, type PropsWithChildren, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useLoginMutation, useLogoutMutation } from "@/api/auth";
import { AuthUser, UserLoginRequest } from "@/types/auth";
import { isAxiosError } from "axios";
import { axiosInstance } from "@/lib/axios";
import { AuthContext } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import Spinner from "./Spinner";

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  const handleRedirect = (userData: AuthUser, location: string) => {
    if (["Admin", "Super Admin"].includes(userData.role)) {
      navigate(location);
    } else {
      navigate("/");
    }
  };

  const login = async (
    request: UserLoginRequest,
    onError?: (msg: string) => void,
  ) => {
    try {
      setIsLoading(true);

      await loginMutation.mutateAsync(request);
      await queryClient.invalidateQueries({ queryKey: ["authUser"] });

      const freshUser = await queryClient.fetchQuery({
        queryKey: ["authUser"],
        queryFn: async () => {
          const response = await axiosInstance.get("/auth/_current");
          return response.data.data as AuthUser;
        },
        staleTime: 0,
      });

      if (freshUser) {
        toast({
          title: "Login berhasil!",
          description: "Selamat datang kembali.",
        });
        setAuthUser(freshUser);
        handleRedirect(freshUser, "dashboard");
      } else {
        navigate("/");
      }
    } catch (e) {
      let msg = "Terjadi kesalahan saat login";
      if (isAxiosError(e)) {
        switch (e.status) {
          case 400:
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
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await logoutMutation.mutateAsync();
      setAuthUser(null);
    } catch (e) {
      console.error("Logout error backend", e);
    } finally {
      queryClient.setQueryData(["authUser"], null);
      queryClient.removeQueries({ queryKey: ["authUser"] });
      setIsLoading(false);
      navigate("/", { replace: true });
    }
  };

  const value = useMemo(
    () => ({
      user: authUser,
      isLoading,
      isAuthenticated: !!authUser,
      login,
      logout,
    }),
    [authUser, isLoading],
  );

  useEffect(() => {
    const getAuthInitialState = async () => {
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
          handleRedirect(freshUser, location.pathname);
        } else {
          navigate("/");
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsInitialized(true);
      }
    };

    getAuthInitialState();
  }, []);

  if (!isInitialized) {
    return <Spinner />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
