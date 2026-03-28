import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/types/response";
import { DashboardStats } from "@/types/dashboard";

export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data } =
        await axiosInstance.get<ApiResponse<DashboardStats>>("/dashboard");
      return data?.data;
    },
    select: (data) => data,
    staleTime: 1000 * 60 * 3,
  });
};
