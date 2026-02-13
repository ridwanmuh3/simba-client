export interface DeleteFinanceRequest {
  id?: number;
}

export interface FinanceData {
  id?: number;
  type?: string;
  category?: string;
  description?: string;
  amount?: number;
  proofImage?: string;
  extraNote?: string;
  createdAt?: string;
}
