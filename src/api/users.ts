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
import { useMutation, useQuery } from "@tanstack/react-query";

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
          password: request.password,
        },
      );
      return response.data.status;
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

export const useGetAllUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<User[]>>("/users");
      return {
        users: response.data.data,
        paging: response.data.paging,
      } satisfies {
        users: User[];
        paging: PagingMetadata;
      };
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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
    staleTime: 1000 * 60 * 4,
    refetchOnWindowFocus: true,
  });
};
