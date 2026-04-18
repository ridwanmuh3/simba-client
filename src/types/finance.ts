export type FinanceType = "PEMASUKAN" | "PENGELUARAN";

export interface DeleteFinanceRequest {
  id: number;
}

export interface FinanceData {
  id: number;
  type: FinanceType;
  category: string;
  description: string;
  amount: number;
  proofImage: string;
  extraNote: string;
  createdAt: string;
}

export interface FinanceSummary {
  totalIn: number;
  totalOut: number;
  profit: number;
  count: number;
}

export interface FinanceTrendPoint {
  label: string;
  masuk: number;
  keluar: number;
}

export interface FinanceCategoryPoint {
  name: string;
  value: number;
}
