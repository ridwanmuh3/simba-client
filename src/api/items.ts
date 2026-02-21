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
  StocksFinanceSummary,
} from "@/types/item";
import { ApiResponse, PagingMetadata } from "@/types/response";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

export const useAddItem = () => {
  return useMutation<ApiResponse<Item>, Error, AddItemRequest>({
    mutationFn: async (request) => {
      const { data } = await axiosInstance.post<ApiResponse<Item>>(
        "/items",
        request,
      );

      return data;
    },
    onSuccess: ({ data: newItem }) => {
      queryClient.setQueriesData({ queryKey: ["items"] }, (old: any) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: [newItem, ...old.data],
        };
      });

      queryClient.setQueriesData(
        { queryKey: ["items-stock-mapping"] },
        (old: Item[] | undefined) => {
          if (!old) return [newItem];
          return [newItem, ...old];
        },
      );
    },
  });
};

export const useEditItem = () => {
  return useMutation<ApiResponse<Item>, Error, EditItemRequest>({
    mutationFn: async ({ id, ...rest }) => {
      const { data } = await axiosInstance.put<ApiResponse<Item>>(
        `/items/${id}`,
        rest,
      );

      return data;
    },
    onSuccess: ({ data: updatedItem }) => {
      queryClient.setQueriesData({ queryKey: ["items"] }, (old: any) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: old.data.map((item: Item) =>
            item.id === updatedItem.id ? updatedItem : item,
          ),
        };
      });

      queryClient.setQueriesData(
        { queryKey: ["items-stock-mapping"] },
        (old: any) => {
          if (!old) return old;

          return old.map((item: Item) =>
            item.id === updatedItem.id ? updatedItem : item,
          );
        },
      );
    },
  });
};

export const useUpdateStockItem = () => {
  return useMutation<ApiResponse<StockTracking>, Error, UpdateItemStockRequest>(
    {
      mutationFn: async ({ itemId, type, amount, supplier, unitPrice }) => {
        const { data } = await axiosInstance.put<ApiResponse<StockTracking>>(
          `/items/${itemId}/stocks`,
          {
            type,
            amount,
            supplier,
            unitPrice,
          },
        );

        return data;
      },
      onSuccess: ({ data: updatedStock }) => {
        queryClient.setQueriesData(
          { queryKey: ["items-stock"] },
          (old: any) => {
            if (!old?.data) return old;

            return {
              ...old,
              data: old.data.map((stock: StockTracking) =>
                stock.id === updatedStock.id ? updatedStock : stock,
              ),
            };
          },
        );

        queryClient.invalidateQueries({
          queryKey: ["dashboard-stats"],
        });

        queryClient.invalidateQueries({
          queryKey: ["stocks-finance-summary"],
        });
      },
    },
  );
};

export const useImportItems = () => {
  return useMutation<ApiResponse<boolean>, Error, FormData>({
    mutationFn: async (formData) => {
      const { data } = await axiosInstance.post<ApiResponse<boolean>>(
        "/items/import",
        formData,
      );

      return data;
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["items"] }),
        queryClient.invalidateQueries({ queryKey: ["items-stock"] }),
        queryClient.invalidateQueries({
          queryKey: ["items-stock-mapping"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["dashboard-stats"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["stocks-finance-summary"],
        }),
      ]);
    },
  });
};

export const useDeleteItem = () => {
  return useMutation<
    ApiResponse<boolean>,
    Error,
    DeleteItemRequest,
    {
      previousItems: [any, any][];
      previousStocks: [any, any][];
      previousMapping: [any, any][];
    }
  >({
    mutationFn: async ({ id }) => {
      const { data } = await axiosInstance.delete<ApiResponse<boolean>>(
        `/items/${id}`,
      );

      return data;
    },

    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["items"] });

      const previousItems = queryClient.getQueriesData({ queryKey: ["items"] });

      const previousStocks = queryClient.getQueriesData({
        queryKey: ["items-stock"],
      });

      const previousMapping = queryClient.getQueriesData({
        queryKey: ["items-stock-mapping"],
      });

      // update items list
      queryClient.setQueriesData({ queryKey: ["items"] }, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((item: any) => item.id !== id),
        };
      });

      return { previousItems, previousStocks, previousMapping };
    },

    onError: (_err, _vars, context) => {
      context?.previousItems?.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      );

      context?.previousStocks?.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      );

      context?.previousMapping?.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({
        queryKey: ["stocks-finance-summary"],
      });
    },
  });
};

export const useDeleteStockItem = () => {
  return useMutation<
    ApiResponse<boolean>,
    Error,
    DeleteItemStockRequest,
    { previousStocks: [any, any][] }
  >({
    mutationFn: async ({ id, stockId }) => {
      const { data } = await axiosInstance.delete<ApiResponse<boolean>>(
        `/items/${id}/stocks/${stockId}`,
      );

      return data;
    },
    onMutate: async ({ stockId }) => {
      await queryClient.cancelQueries({ queryKey: ["items-stock"] });

      const previousStocks = queryClient.getQueriesData({
        queryKey: ["items-stock"],
      });

      queryClient.setQueriesData({ queryKey: ["items-stock"] }, (old: any) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: old.data.filter((stock: any) => stock.id !== stockId),
        };
      });

      return { previousStocks };
    },
    onError: (_err, _vars, context) => {
      context?.previousStocks?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({
        queryKey: ["stocks-finance-summary"],
      });
    },
  });
};

export const useGetAllItems = (
  searchQuery: string,
  page: number,
  limit: number,
  dateFrom?: Date,
  dateTo?: Date,
) => {
  const startDate = dateFrom?.toISOString() ?? null;
  const endDate = dateTo?.toISOString() ?? null;

  return useQuery<{
    data: Item[];
    paging: PagingMetadata;
  }>({
    queryKey: ["items-stock", { searchQuery, page, limit, startDate, endDate }],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse<Item[]>>("/items", {
        params: {
          page,
          size: limit,
          search_query: searchQuery || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        },
      });

      return {
        data: data.data ?? [],
        paging: data.paging ?? null,
      };
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    enabled: page > 0 && limit > 0,
  });
};

export const useGetFullItems = () => {
  return useQuery<Item[]>({
    queryKey: ["items-stock-mapping"],
    queryFn: async () => {
      const { data } =
        await axiosInstance.get<ApiResponse<Item[]>>("/items/export");

      return data.data ?? [];
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
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
  const startDate = dateFrom?.toISOString() ?? null;
  const endDate = dateTo?.toISOString() ?? null;

  return useQuery<{
    data: StockTracking[];
    paging: PagingMetadata;
  }>({
    queryKey: [
      "items-stock",
      {
        searchQuery,
        page,
        limit,
        startDate,
        endDate,
        transactionType,
      },
    ],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse<StockTracking[]>>(
        "/items/stocks",
        {
          params: {
            page,
            size: limit,
            search_query: searchQuery || undefined,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
            type: transactionType !== "ALL" ? transactionType : undefined,
          },
        },
      );

      return {
        data: data.data ?? [],
        paging: data.paging ?? null,
      };
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};

export const useGetStocksFinanceSummary = () => {
  return useQuery<StocksFinanceSummary>({
    queryKey: ["stocks-finance-summary"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<
        ApiResponse<StocksFinanceSummary>
      >("/items/stocks/summary");

      return data.data;
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
