export interface AddItemRequest {
  name?: string;
  category?: string;
  stock?: number;
  measureUnit?: string;
  unitPrice?: number;
}

export interface UpdateItemStockRequest {
  itemId?: string;
  type?: string;
  amount?: number;
  supplier?: string;
}

export interface EditItemRequest extends AddItemRequest {
  id?: string;
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
}

export interface StockTracking {
  id?: number;
  type?: "IN" | "OUT";
  supplier?: string;
  previousStock?: number;
  newStock?: number;
  amount?: number;
  createdAt?: string;
  item?: Item;
}
