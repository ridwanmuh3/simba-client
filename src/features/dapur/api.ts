import { axiosInstance } from "@/core/http/axios";
import { queryClient } from "@/core/query/client";
import { queryKeys } from "@/core/query/keys";
import { ApiResponse } from "@/types/response";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dapur, SelectDapurRequest } from "./types";

export const useGetDapurs = () => {
  return useQuery<Dapur[]>({
    queryKey: queryKeys.dapur.list,
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse<Dapur[]>>("/dapurs");
      return data.data ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useSelectDapurMutation = () => {
  return useMutation<void, Error, SelectDapurRequest>({
    mutationFn: async (request) => {
      await axiosInstance.post("/auth/select-dapur", request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.current });
    },
  });
};
