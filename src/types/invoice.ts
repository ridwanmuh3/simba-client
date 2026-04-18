export type InvoiceStockType = "IN" | "OUT";

export interface InvoiceHistoryData {
  id: number;
  stockType: InvoiceStockType;
  companyName: string;
  companyContact: string;
  companyAddress: string;
  invoiceNumber: string;
  poNumber: string;
  quoNumber: string;
  hasItems: boolean;
  createdAt: string;
  updatedAt: string;
}
