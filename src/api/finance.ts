import { axiosInstance } from "@/lib/axios";
import { queryClient } from "@/lib/react-query";
import { FinanceData } from "@/types/finance";
import { ApiResponse } from "@/types/response";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useAddFinance = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await axiosInstance.post<ApiResponse<any>>(
        "/finances",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["finances"] });
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
  return useQuery({
    queryKey: ["finances", searchQuery, page, limit, dateFrom, dateTo],
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

      const response = await axiosInstance.get<ApiResponse<FinanceData[]>>(
        `/finances?${params.toString()}`,
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
