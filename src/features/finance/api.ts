import { axiosInstance } from "@/core/http/axios";
import { queryClient } from "@/core/query/client";
import { queryKeys } from "@/core/query/keys";
import { ApiResponse, PagingMetadata } from "@/types/response";
import { DeleteFinanceRequest, FinanceData } from "./types";
import {
  keepPreviousData,
  QueryKey,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

interface FinanceListQueryData {
  data: FinanceData[];
  paging: PagingMetadata;
}

const buildEmptyPaging = (page: number, size: number): PagingMetadata => ({
  page,
  size,
  totalItem: 0,
  totalPage: 1,
});

export const useAddFinance = () => {
  return useMutation<ApiResponse<FinanceData>, Error, FormData>({
    mutationFn: async (formData) => {
      const { data } = await axiosInstance.post<ApiResponse<FinanceData>>(
        "/finances",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return data;
    },
    onSuccess: ({ data: newFinance }) => {
      if (!newFinance) return;

      queryClient.setQueriesData<FinanceListQueryData>(
        { queryKey: queryKeys.finance.all },
        (old) => {
          if (!old) return old;
          return { ...old, data: [newFinance, ...old.data] };
        },
      );

      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.report });
    },
  });
};

export const useEditFinance = () => {
  return useMutation<
    ApiResponse<FinanceData>,
    Error,
    { financeId: number; formData: FormData }
  >({
    mutationFn: async ({ financeId, formData }) => {
      const { data } = await axiosInstance.put<ApiResponse<FinanceData>>(
        `/finances/${financeId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return data;
    },
    onSuccess: ({ data: updatedFinance }) => {
      if (!updatedFinance) return;

      queryClient.setQueriesData<FinanceListQueryData>(
        { queryKey: queryKeys.finance.all },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((item) =>
              item.id === updatedFinance.id ? updatedFinance : item,
            ),
          };
        },
      );

      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.report });
    },
  });
};

export const useDeleteFinance = () => {
  return useMutation<
    ApiResponse<boolean>,
    Error,
    DeleteFinanceRequest,
    { previous: Array<[QueryKey, FinanceListQueryData | undefined]> }
  >({
    mutationFn: async ({ id }) => {
      const { data } = await axiosInstance.delete<ApiResponse<boolean>>(
        `/finances/${id}`,
      );
      return data;
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.finance.all });

      const previous = queryClient.getQueriesData<FinanceListQueryData>({
        queryKey: queryKeys.finance.all,
      });

      queryClient.setQueriesData<FinanceListQueryData>(
        { queryKey: queryKeys.finance.all },
        (old) => {
          if (!old) return old;
          return { ...old, data: old.data.filter((item) => item.id !== id) };
        },
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.report });
    },
  });
};

export const useGetAllFinancesForReport = () => {
  return useQuery<FinanceData[]>({
    queryKey: queryKeys.finance.report,
    queryFn: async () => {
      const { data } =
        await axiosInstance.get<ApiResponse<FinanceData[]>>("/finances/export");
      return data.data ?? [];
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useGetAllFinances = (
  searchQuery: string,
  page: number,
  limit: number,
  dateFrom?: Date,
  dateTo?: Date,
) => {
  const startDate = dateFrom?.toISOString();
  const endDate = dateTo?.toISOString();

  return useQuery<FinanceListQueryData>({
    queryKey: queryKeys.finance.list(searchQuery, page, limit, startDate, endDate),
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse<FinanceData[]>>(
        "/finances",
        {
          params: {
            page,
            size: limit,
            search_query: searchQuery || undefined,
            start_date: startDate,
            end_date: endDate,
          },
        },
      );
      return {
        data: data.data ?? [],
        paging: data.paging ?? buildEmptyPaging(page, limit),
      };
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    enabled: page > 0 && limit > 0,
    placeholderData: keepPreviousData,
  });
};
