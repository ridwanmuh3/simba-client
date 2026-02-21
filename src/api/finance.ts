import { axiosInstance } from "@/lib/axios";
import { queryClient } from "@/lib/react-query";
import { DeleteFinanceRequest, FinanceData } from "@/types/finance";
import { ApiResponse, PagingMetadata } from "@/types/response";
import {
  keepPreviousData,
  QueryKey,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

export const useAddFinance = () => {
  return useMutation<ApiResponse<FinanceData>, Error, FormData>({
    mutationFn: async (formData) => {
      console.log(formData);
      const { data } = await axiosInstance.post<ApiResponse<FinanceData>>(
        "/finances",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return data;
    },
    onSuccess: ({ data: newFinance }) => {
      queryClient.setQueriesData({ queryKey: ["finances"] }, (old: any) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: [newFinance, ...old.data],
        };
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard-stats"],
      });
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
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return data;
    },

    onSuccess: ({ data: updatedFinance }) => {
      queryClient.setQueriesData({ queryKey: ["finances"] }, (old: any) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: old.data.map((item: FinanceData) =>
            item.id === updatedFinance.id ? updatedFinance : item,
          ),
        };
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard-stats"],
      });
    },
  });
};

export const useDeleteFinance = () => {
  return useMutation<
    ApiResponse<boolean>,
    Error,
    DeleteFinanceRequest,
    { previous: [unknown, any][] }
  >({
    mutationFn: async ({ id }) => {
      const { data } = await axiosInstance.delete<ApiResponse<boolean>>(
        `/finances/${id}`,
      );
      return data;
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["finances"] });

      const previous = queryClient.getQueriesData({
        queryKey: ["finances"],
      });

      queryClient.setQueriesData({ queryKey: ["finances"] }, (old: any) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: old.data.filter((item: FinanceData) => item.id !== id),
        };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([key, data]) => {
        queryClient.setQueryData(key as QueryKey, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["dashboard-stats"],
      });
    },
  });
};

export const useGetAllFinances = (
  searchQuery: string,
  page: number,
  limit: number,
  dateFrom?: Date,
  dateTo?: Date,
) => {
  const startDate = dateFrom?.toISOString() ?? null;
  const endDate = dateTo?.toISOString() ?? null;

  return useQuery<{
    data: FinanceData[];
    paging: PagingMetadata;
  }>({
    queryKey: ["finances", { searchQuery, page, limit, startDate, endDate }],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse<FinanceData[]>>(
        "/finances",
        {
          params: {
            page,
            size: limit,
            search_query: searchQuery || undefined,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
          },
        },
      );

      return {
        data: data.data ?? [],
        paging: data.paging ?? null,
      };
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    enabled: page > 0 && limit > 0,
    placeholderData: keepPreviousData,
  });
};
