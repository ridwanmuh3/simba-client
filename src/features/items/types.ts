export interface AddItemRequest {
  name?: string;
  category?: string;
  stock?: number;
  measureUnit?: string;
  unitPrice?: number;
  dateAdded?: Date | string;
}

export interface EditItemRequest extends AddItemRequest {
  id?: string;
  initialStock?: number;
}

export interface DeleteItemRequest {
  id?: string;
}

export interface UpdateItemStockRequest {
  itemId?: string;
  type?: string;
  amount?: number;
  supplier?: string;
  unitPrice?: number;
}

export interface DeleteItemStockRequest extends DeleteItemRequest {
  stockId?: number;
}

export interface Item {
  id?: string;
  name?: string;
  category?: string;
  stock?: number;
  initialStock?: number;
  measureUnit?: string;
  unitPrice?: number;
  totalPrice?: number;
  createdAt?: string;
}

export interface StockTracking {
  id?: number;
  type?: "IN" | "OUT";
  supplier?: string;
  previousStock?: number;
  newStock?: number;
  amount?: number;
  unitPrice?: number;
  totalPrice?: number;
  createdAt?: string;
  item?: Item;
}

export interface StocksFinanceSummary {
  masterItemsTotalBudget?: number;
  budgetIn?: number;
  budgetOut?: number;
  profit?: number;
  currentBudget?: number;
}

export interface ItemStocksSummary {
  itemId?: string;
  name?: string;
  category?: string;
  initialStock?: number;
  measureUnit?: string;
  totalIn?: number;
  totalOut?: number;
  currentStock?: number;
  buyPrice?: number;
  sellPrice?: number;
  stockValue?: number;
}

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
