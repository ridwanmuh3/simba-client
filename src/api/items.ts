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
import { InvoiceHistoryData } from "@/types/invoice";
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
      queryClient.invalidateQueries({ queryKey: ["items-stock"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["items-stock-mapping"] });
      queryClient.invalidateQueries({ queryKey: ["stocks-finance-summary"] });
      queryClient.invalidateQueries({ queryKey: ["items-stocks-summary"] });
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
      queryClient.invalidateQueries({ queryKey: ["items-stock"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["items-stock-mapping"] });
      queryClient.invalidateQueries({ queryKey: ["stocks-finance-summary"] });
      queryClient.invalidateQueries({ queryKey: ["items-stocks-summary"] });
    },
  });
};

export const useUpdateStockItem = () => {
  return useMutation({
    mutationFn: async (request: UpdateItemStockRequest) => {
      const response = await axiosInstance.post<ApiResponse<StockTracking>>(
        `/items/${request.itemId}/stocks`,
        {
          type: request.type,
          amount: request.amount,
          supplier: request.supplier,
          unit_price: request.unitPrice,
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items-stock"] });
      queryClient.invalidateQueries({ queryKey: ["items-stock-mapping"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["stocks-finance-summary"] });
      queryClient.invalidateQueries({ queryKey: ["items-stocks-summary"] });
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
      queryClient.invalidateQueries({ queryKey: ["items-stock"] });
      queryClient.invalidateQueries({ queryKey: ["items-stock-mapping"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["stocks-finance-summary"] });
      queryClient.invalidateQueries({ queryKey: ["items-stocks-summary"] });
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
      queryClient.invalidateQueries({ queryKey: ["items-stock"] });
      queryClient.invalidateQueries({ queryKey: ["items-stock-mapping"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["stocks-finance-summary"] });
      queryClient.invalidateQueries({ queryKey: ["items-stocks-summary"] });
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
      queryClient.invalidateQueries({ queryKey: ["items-stock"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["items-stock-mapping"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["stocks-finance-summary"] });
      queryClient.invalidateQueries({ queryKey: ["items-stocks-summary"] });
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
        data: response.data?.data || [],
        paging: response.data?.paging || null,
      };
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
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
    staleTime: 1000 * 60 * 5,
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

interface StocksFinanceSummary {
  masterItemsTotalBudget?: number;
  budgetIn?: number;
  budgetOut?: number;
  profit?: number;
  currentBudget?: number;
}

export interface GenerateInvoiceRequest {
  companyName: string;
  companyAddress: string;
  companyContact: string;
  invoiceNo: string;
  date: string;
  poNo?: string;
  quoNo?: string;
  receiverName: string;
  receiverAddress: string;
  dateFrom?: string;
  dateTo?: string;
  stockType?: "IN" | "OUT";
  keterangan?: string;
  penanggungjawab: string;
  jabatan: string;
  bankAccount?: string;
}

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
      if (mode === "view") {
        params.set("mode", "view");
      }

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
    queryKey: [
      "invoice-history",
      searchQuery,
      page,
      limit,
      dateFrom?.toISOString(),
      dateTo?.toISOString(),
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

      const response = await axiosInstance.get<
        ApiResponse<InvoiceHistoryData[]>
      >(`/items/invoices?${params.toString()}`);

      return {
        data: response.data?.data || [],
        paging: response.data?.paging || null,
      };
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useGetStocksFinanceSummary = () => {
  return useQuery({
    queryKey: ["stocks-finance-summary"],
    queryFn: async () => {
      const response = await axiosInstance.get<
        ApiResponse<StocksFinanceSummary>
      >("/items/stocks/summary");

      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export interface ItemStocksSummary {
  itemId?: string;
  name?: string;
  category?: string;
  initialStock?: number;
  measureUnit?: string;
  totalIn?: number;
  totalOut?: number;
  currentStock?: number;
  buyPrice?: number; // Ditambahkan untuk perhitungan frontend
  sellPrice?: number; // Ditambahkan untuk perhitungan frontend
  stockValue?: number;
}

export const useGetItemsStocksSummary = (
  searchQuery: string,
  page: number,
  limit: number,
  dateFrom?: Date,
  dateTo?: Date,
) => {
  return useQuery({
    queryKey: [
      "items-stocks-summary",
      searchQuery,
      page,
      limit,
      dateFrom?.toISOString(),
      dateTo?.toISOString(),
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

      const response = await axiosInstance.get<
        ApiResponse<ItemStocksSummary[]>
      >(`/items/stocks/opname?${params.toString()}`);

      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
