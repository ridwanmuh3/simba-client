import { axiosInstance } from "@/core/http/axios";
import { queryClient } from "@/core/query/client";
import { queryKeys } from "@/core/query/keys";
import { ApiResponse } from "@/types/response";
import { AuthUser, UserLoginRequest } from "./types";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useLoginMutation = () => {
  return useMutation<AuthUser, Error, UserLoginRequest>({
    mutationFn: async (request) => {
      const { data } = await axiosInstance.post<ApiResponse<AuthUser>>(
        "/auth/login",
        request,
      );
      return data.data!;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.current, data);
    },
  });
};

export const useLogoutMutation = () => {
  return useMutation<void, Error>({
    mutationFn: async () => {
      await axiosInstance.delete("/auth/logout");
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

export const useCurrentAuth = (enabled: boolean) => {
  return useQuery<AuthUser>({
    queryKey: queryKeys.auth.current,
    queryFn: async () => {
      const { data } =
        await axiosInstance.get<ApiResponse<AuthUser>>("/auth/_current");
      return data.data!;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled,
  });
};
