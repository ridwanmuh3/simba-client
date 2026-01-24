import { axiosInstance } from "@/lib/axios";
import { AddItemRequest, DeleteItemRequest, Item } from "@/types/item";
import { ApiResponse } from "@/types/response";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useAddItem = () => {
  return useMutation({
    mutationFn: async (request: AddItemRequest) => {
      const response = await axiosInstance.post<ApiResponse<Item>>(
        "/items",
        request,
      );
      return response.data;
    },
  });
};

export const useDeleteInitialItem = () => {
  return useMutation({
    mutationFn: async (request: DeleteItemRequest) => {
      const response = await axiosInstance.delete<ApiResponse<boolean>>(
        `/items/${request.id}`,
      );
      return response.data;
    },
  });
};

export const useGetAllItems = () => {
  return useQuery({
    queryKey: ["items"],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<Item[]>>("/items");
      return {
        data: response.data.data || [],
        paging: response.data.paging || null,
      };
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
};
