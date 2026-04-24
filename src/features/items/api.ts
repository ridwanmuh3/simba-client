import { axiosInstance } from "@/core/http/axios";
import { queryClient } from "@/core/query/client";
import { queryKeys } from "@/core/query/keys";
import { ApiResponse } from "@/types/response";
import {
  AddItemRequest,
  DeleteItemRequest,
  DeleteItemStockRequest,
  EditItemRequest,
  GenerateInvoiceRequest,
  InvoiceHistoryData,
  UpdateInvoiceRequest,
  Item,
  ItemStocksSummary,
  StockTracking,
  StocksFinanceSummary,
  UpdateItemStockRequest,
} from "./types";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

const invalidateItemQueries = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.items.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.items.full });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
  queryClient.invalidateQueries({ queryKey: queryKeys.items.financeSummary });
  queryClient.invalidateQueries({ queryKey: ["items-stocks-summary"] });
};

export const useAddItem = () => {
  return useMutation({
    mutationFn: async (request: AddItemRequest) => {
      const { data } = await axiosInstance.post<ApiResponse<Item>>(
        "/items",
        request,
      );
      return data;
    },
    onSuccess: invalidateItemQueries,
  });
};

export const useEditItem = () => {
  return useMutation({
    mutationFn: async (request: EditItemRequest) => {
      const { data } = await axiosInstance.put<ApiResponse<Item>>(
        `/items/${request.id}`,
        request,
      );
      return data;
    },
    onSuccess: invalidateItemQueries,
  });
};

export const useUpdateStockItem = () => {
  return useMutation({
    mutationFn: async (request: UpdateItemStockRequest) => {
      const { data } = await axiosInstance.post<ApiResponse<StockTracking>>(
        `/items/${request.itemId}/stocks`,
        {
          type: request.type,
          amount: request.amount,
          supplier: request.supplier,
          unit_price: request.unitPrice,
        },
      );
      return data;
    },
    onSuccess: invalidateItemQueries,
  });
};

export const useImportItems = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await axiosInstance.post("/items/import", formData);
      return data;
    },
    onSuccess: invalidateItemQueries,
  });
};

export const useDeleteItem = () => {
  return useMutation({
    mutationFn: async (request: DeleteItemRequest) => {
      const { data } = await axiosInstance.delete<ApiResponse<boolean>>(
        `/items/${request.id}`,
      );
      return data;
    },
    onSuccess: invalidateItemQueries,
  });
};

export const useDeleteStockItem = () => {
  return useMutation({
    mutationFn: async (request: DeleteItemStockRequest) => {
      const { data } = await axiosInstance.delete<ApiResponse<boolean>>(
        `/items/${request.id}/stocks/${request.stockId}`,
      );
      return data;
    },
    onSuccess: invalidateItemQueries,
  });
};

export const useGetAllItems = (
  searchQuery: string,
  page: number,
  limit: number,
) => {
  return useQuery({
    queryKey: queryKeys.items.list(searchQuery, page, limit),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        size: String(limit),
      });
      if (searchQuery) params.append("search_query", searchQuery);

      const { data } = await axiosInstance.get<ApiResponse<Item[]>>(
        `/items?${params.toString()}`,
      );
      return { data: data.data ?? [], paging: data.paging ?? null };
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};

export const useGetFullItems = () => {
  return useQuery({
    queryKey: queryKeys.items.full,
    queryFn: async () => {
      const { data } =
        await axiosInstance.get<ApiResponse<Item[]>>(`/items/export`);
      return { data: data.data ?? [], paging: data.paging ?? null };
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useGetItemCategories = () => {
  return useQuery({
    queryKey: ["item-categories"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse<string[]>>(
        "/items/categories",
      );
      return data.data ?? [];
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
  category = "",
) => {
  return useQuery({
    queryKey: queryKeys.items.listWithFilters(
      searchQuery,
      page,
      limit,
      dateFrom,
      dateTo,
      transactionType,
      category,
    ),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        size: String(limit),
      });
      if (searchQuery) params.append("search_query", searchQuery);
      if (dateFrom) params.append("start_date", dateFrom.toISOString());
      if (dateTo) params.append("end_date", dateTo.toISOString());
      if (transactionType && transactionType !== "ALL")
        params.append("type", transactionType);
      if (category) params.append("category", category);

      const { data } = await axiosInstance.get<ApiResponse<StockTracking[]>>(
        `/items/stocks?${params.toString()}`,
      );
      return { data: data.data ?? [], paging: data.paging ?? null };
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};

export const useGetStocksFinanceSummary = () => {
  return useQuery({
    queryKey: queryKeys.items.financeSummary,
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse<StocksFinanceSummary>>(
        "/items/stocks/summary",
      );
      return data;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useGetItemsStocksSummary = (
  searchQuery: string,
  page: number,
  limit: number,
  dateFrom?: Date,
  dateTo?: Date,
) => {
  return useQuery({
    queryKey: queryKeys.items.stocksSummary(
      searchQuery,
      page,
      limit,
      dateFrom,
      dateTo,
    ),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        size: String(limit),
      });
      if (searchQuery) params.append("search_query", searchQuery);
      if (dateFrom) params.append("start_date", dateFrom.toISOString());
      if (dateTo) params.append("end_date", dateTo.toISOString());

      const { data } = await axiosInstance.get<ApiResponse<ItemStocksSummary[]>>(
        `/items/stocks/opname?${params.toString()}`,
      );
      return data;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};

export const useGenerateInvoice = () => {
  return useMutation({
    mutationFn: async (request: GenerateInvoiceRequest) => {
      const response = await axiosInstance.post<Blob>(
        "/items/invoice",
        request,
        { responseType: "blob" },
      );
      const disposition = response.headers["content-disposition"] ?? "";
      const match = /filename="?([^";]+)"?/i.exec(disposition);
      const filename = match?.[1]
        ? decodeURIComponent(match[1])
        : `invoice-${request.invoiceNo}.pdf`;
      return { blob: response.data, filename };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice-history"] });
    },
  });
};

export const useDownloadInvoicePDF = () => {
  return useMutation({
    mutationFn: async ({
      id,
      mode,
    }: {
      id: number;
      mode?: "download" | "view";
    }) => {
      const params = new URLSearchParams();
      if (mode === "view") params.set("mode", "view");

      const qs = params.toString();
      const response = await axiosInstance.get<Blob>(
        `/items/invoices/${id}/pdf${qs ? `?${qs}` : ""}`,
        { responseType: "blob" },
      );
      const disposition = response.headers["content-disposition"] ?? "";
      const match = /filename="?([^";]+)"?/i.exec(disposition);
      const filename = match?.[1]
        ? decodeURIComponent(match[1])
        : `invoice-${id}.pdf`;
      return { blob: response.data, filename };
    },
  });
};

export const useGetInvoiceHistory = (
  searchQuery: string,
  page: number,
  limit: number,
  dateFrom?: Date,
  dateTo?: Date,
) => {
  return useQuery({
    queryKey: queryKeys.items.invoiceHistory(
      searchQuery,
      page,
      limit,
      dateFrom,
      dateTo,
    ),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        size: String(limit),
      });
      if (searchQuery) params.append("search_query", searchQuery);
      if (dateFrom) params.append("start_date", dateFrom.toISOString());
      if (dateTo) params.append("end_date", dateTo.toISOString());

      const { data } = await axiosInstance.get<ApiResponse<InvoiceHistoryData[]>>(
        `/items/invoices?${params.toString()}`,
      );
      return { data: data.data ?? [], paging: data.paging ?? null };
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};

export const useUpdateInvoice = () => {
  return useMutation({
    mutationFn: async ({
      id,
      request,
    }: {
      id: number;
      request: UpdateInvoiceRequest;
    }) => {
      const { data } = await axiosInstance.patch<ApiResponse<boolean>>(
        `/items/invoices/${id}`,
        request,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice-history"] });
    },
  });
};

export const useDeleteInvoice = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await axiosInstance.delete<ApiResponse<boolean>>(
        `/items/invoices/${id}`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice-history"] });
    },
  });
};
