import { axiosInstance } from "@/lib/axios";
import { AuthUser, UserLoginRequest } from "@/types/auth";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async (request: UserLoginRequest) => {
      const response = await axiosInstance.post("/auth/login", request);
      return response.data;
    },
  });
};

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: async () => {
      return await axiosInstance.delete("/auth/logout");
    },
  });
};
export const useCurrentAuth = () => {
  return useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const response = await axiosInstance.get("/auth/_current");
      return response.data.data as AuthUser;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });
};
