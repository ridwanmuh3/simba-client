export interface AddItemRequest {
  name?: string;
  category?: string;
  stock?: number;
  measureUnit?: string;
  unitPrice?: number;
  dateAdded?: Date | string;
}

export interface UpdateItemStockRequest {
  itemId?: string;
  type?: string;
  amount?: number;
  supplier?: string;
  unitPrice?: number;
}

export interface EditItemRequest extends AddItemRequest {
  id?: string;
  initialStock?: number;
}

export interface DeleteItemRequest {
  id?: string;
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
