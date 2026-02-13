import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/types/response";

export interface DashboardStats {
  totalItems: number;
  stockIn: number;
  stockOut: number;
  totalBudget: number;
  budgetIn: number;
  budgetOut: number;
  monthlyBudget: {
    month: string;
    in: number;
    out: number;
  }[];
  expenseComposition: {
    category: string;
    amount: number;
  }[];
  systemActivities: {
    id: number;
    type: string;
    title: string;
    description: string;
    createdAt: string;
  }[];
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response =
        await axiosInstance.get<ApiResponse<DashboardStats>>("/dashboard");
      return response.data;
    },
    staleTime: 1000 * 60 * 3,
  });
};
