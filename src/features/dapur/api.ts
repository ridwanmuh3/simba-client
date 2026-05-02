import { axiosInstance } from "@/core/http/axios";
import { queryClient } from "@/core/query/client";
import { queryKeys } from "@/core/query/keys";
import { ApiResponse } from "@/types/response";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CreateDapurRequest,
  Dapur,
  DeleteDapurRequest,
  SelectDapurRequest,
  UpdateDapurRequest,
} from "./types";

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
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: queryKeys.auth.current });
    },
  });
};

export const useCreateDapurMutation = () => {
  return useMutation<Dapur, Error, CreateDapurRequest>({
    mutationFn: async (request) => {
      const { data } = await axiosInstance.post<ApiResponse<Dapur>>("/dapurs", request);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dapur.list });
    },
  });
};

export const useUpdateDapurMutation = () => {
  return useMutation<Dapur, Error, UpdateDapurRequest>({
    mutationFn: async ({ id, ...rest }) => {
      const { data } = await axiosInstance.put<ApiResponse<Dapur>>(`/dapurs/${id}`, rest);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dapur.list });
    },
  });
};

export const useDeleteDapurMutation = () => {
  return useMutation<void, Error, DeleteDapurRequest>({
    mutationFn: async ({ id }) => {
      await axiosInstance.delete(`/dapurs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dapur.list });
    },
  });
};
