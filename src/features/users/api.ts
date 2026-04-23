import { axiosInstance } from "@/core/http/axios";
import { queryClient } from "@/core/query/client";
import { queryKeys } from "@/core/query/keys";
import { ApiResponse, PagingMetadata } from "@/types/response";
import {
  CreateUserRequest,
  DeleteUserRequest,
  EditUserRequest,
  User,
  UsersStats,
} from "./types";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

export const useCreateUser = () => {
  return useMutation({
    mutationFn: async (request: CreateUserRequest) => {
      const { data } = await axiosInstance.post<ApiResponse<User>>(
        "/users",
        request,
      );
      return data.status;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.stats });
    },
  });
};

export const useEditUser = () => {
  return useMutation({
    mutationFn: async (request: EditUserRequest) => {
      const { data } = await axiosInstance.put<ApiResponse<User>>(
        `/users/${request.id}`,
        {
          fullname: request.fullname,
          old_password: request.password,
        },
      );
      return data.status;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.stats });
    },
  });
};

export const useDeleteUser = () => {
  return useMutation({
    mutationFn: async (request: DeleteUserRequest) => {
      const { data } = await axiosInstance.delete<ApiResponse<User>>(
        `/users/${request.id}`,
      );
      return data.status;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.stats });
    },
  });
};

export const useGetAllUsers = (page: number, limit: number) => {
  return useQuery({
    queryKey: queryKeys.users.list(page, limit),
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse<User[]>>(
        `/users?page=${page}&size=${limit}`,
      );
      return {
        users: data.data!,
        paging: data.paging!,
      } satisfies { users: User[]; paging: PagingMetadata };
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};

export const useGetUsersStats = () => {
  return useQuery({
    queryKey: queryKeys.users.stats,
    queryFn: async () => {
      const { data } =
        await axiosInstance.get<ApiResponse<UsersStats>>("/users/stats");
      return data.data!;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const downloadUserLetter = async (filename: string) => {
  const { data } = await axiosInstance.get(`/storage/${filename}`, {
    responseType: "blob",
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
    params: { _t: Date.now() },
  });
  return data;
};
