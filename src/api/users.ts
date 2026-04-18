import { axiosInstance } from "@/lib/axios";
import { queryClient } from "@/lib/react-query";
import { ApiResponse, PagingMetadata } from "@/types/response";
import {
  CreateUserRequest,
  DeleteUserRequest,
  EditUserRequest,
  User,
  UsersStats,
} from "@/types/user";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

export const useCreateUser = () => {
  return useMutation({
    mutationFn: async (request: CreateUserRequest) => {
      const response = await axiosInstance.post<ApiResponse<User>>(
        "/users",
        request,
      );
      return response.data.status;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users_stats"] });
    },
  });
};

export const useEditUser = () => {
  return useMutation({
    mutationFn: async (request: EditUserRequest) => {
      const response = await axiosInstance.put<ApiResponse<User>>(
        `/users/${request.id}`,
        {
          fullname: request.fullname,
          old_password: request.password,
        },
      );
      return response.data.status;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users_stats"] });
    },
  });
};

export const useDeleteUser = () => {
  return useMutation({
    mutationFn: async (request: DeleteUserRequest) => {
      const response = await axiosInstance.delete<ApiResponse<User>>(
        `/users/${request.id}`,
      );
      return response.data.status;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users_stats"] });
    },
  });
};

export const useGetAllUsers = (page: number, limit: number) => {
  return useQuery({
    queryKey: ["users", page, limit],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<User[]>>(
        `/users?page=${page}&size=${limit}`,
      );
      return {
        users: response.data.data,
        paging: response.data.paging,
      } satisfies {
        users: User[];
        paging: PagingMetadata;
      };
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};

export const useGetUsersStats = () => {
  return useQuery({
    queryKey: ["users_stats"],
    queryFn: async () => {
      const response =
        await axiosInstance.get<ApiResponse<UsersStats>>("/users/stats");
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useDownloadUserLetter = async (filename: string) => {
  const response = await axiosInstance.get(`/storage/${filename}`, {
    responseType: "blob",
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
    params: {
      _t: new Date().getTime(),
    },
  });
  return response.data;
};
