import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/core/http/axios";
import { queryKeys } from "@/core/query/keys";
import { ApiResponse } from "@/types/response";
import { DashboardStats } from "./types";

export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: queryKeys.dashboard.stats,
    queryFn: async () => {
      const { data } =
        await axiosInstance.get<ApiResponse<DashboardStats>>("/dashboard");
      return data.data!;
    },
    staleTime: 1000 * 60 * 3,
  });
};
