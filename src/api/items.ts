import { axiosInstance } from "@/lib/axios";
import { queryClient } from "@/lib/react-query";
import {
  AddItemRequest,
  EditItemRequest,
  DeleteItemRequest,
  Item,
  UpdateItemStockRequest,
  StockTracking,
  DeleteItemStockRequest,
} from "@/types/item";
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
};

export const useEditItem = () => {
  return useMutation({
    mutationFn: async (request: EditItemRequest) => {
      const response = await axiosInstance.put<ApiResponse<Item>>(
        `/items/${request.id}`,
        request,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
};

export const useUpdateStockItem = () => {
  return useMutation({
    mutationFn: async (request: UpdateItemStockRequest) => {
      const response = await axiosInstance.put<ApiResponse<StockTracking>>(
        `/items/${request.itemId}/stocks`,
        {
          type: request.type,
          amount: request.amount,
          supplier: request.supplier,
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["items-stock"],
      });
      queryClient.invalidateQueries({
        queryKey: ["items"],
      });
    },
  });
};

export const useImportItems = () => {
  return useMutation({
    mutationFn: async (request: FormData) => {
      const response = await axiosInstance.post("/items/import", request);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
};

export const useDeleteItem = () => {
  return useMutation({
    mutationFn: async (request: DeleteItemRequest) => {
      const response = await axiosInstance.delete<ApiResponse<boolean>>(
        `/items/${request.id}`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
};

export const useDeleteStockItem = () => {
  return useMutation({
    mutationFn: async (request: DeleteItemStockRequest) => {
      const response = await axiosInstance.delete<ApiResponse<boolean>>(
        `/items/${request.id}/stocks/${request.stockId}`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["items-stock"],
      });
      queryClient.invalidateQueries({
        queryKey: ["items"],
      });
    },
  });
};

export const useGetAllItems = (
  searchQuery: string,
  page: number,
  limit: number,
) => {
  return useQuery({
    queryKey: ["items-stock", searchQuery, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        size: String(limit),
      });

      if (searchQuery) {
        params.append("search_query", searchQuery);
      }

      // if (dateFrom) {
      //   params.append("start_date", dateFrom.toISOString());
      // }
      // if (dateTo) {
      //   params.append("end_date", dateTo.toISOString());
      // }

      const response = await axiosInstance.get<ApiResponse<Item[]>>(
        `/items?${params.toString()}`,
      );

      return {
        data: response.data.data || [],
        paging: response.data.paging || null,
      };
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export const useGetFullItems = () => {
  return useQuery({
    queryKey: ["items-stock-mapping"],
    queryFn: async () => {
      const response =
        await axiosInstance.get<ApiResponse<Item[]>>(`/items/export`);
      return {
        data: response.data?.data || [],
        paging: response.data?.paging || null,
      };
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
};

export const useGetAllItemsStocks = (
  searchQuery: string,
  page: number,
  limit: number,
  dateFrom?: Date,
  dateTo?: Date,
  transactionType = "ALL",
) => {
  return useQuery({
    queryKey: [
      "items-stock",
      searchQuery,
      page,
      limit,
      dateFrom,
      dateTo,
      transactionType,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        size: String(limit),
      });

      if (searchQuery) {
        params.append("search_query", searchQuery);
      }

      if (dateFrom) {
        params.append("start_date", dateFrom.toISOString());
      }

      if (dateTo) {
        params.append("end_date", dateTo.toISOString());
      }

      if (transactionType && transactionType !== "ALL") {
        params.append("type", transactionType);
      }

      const response = await axiosInstance.get<ApiResponse<StockTracking[]>>(
        `/items/stocks?${params.toString()}`,
      );

      return {
        data: response.data?.data || [],
        paging: response.data?.paging || null,
      };
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
