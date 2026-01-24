export interface AddItemRequest {
  name?: string;
  category?: string;
  stock?: number;
  measureUnit?: string;
  pricePerUnit?: number;
}

export interface DeleteItemRequest {
  id?: string;
}

export interface Item {
  id?: string;
  name?: string;
  category?: string;
  stock?: number;
  measureUnit?: string;
  pricePerUnit?: number;
}
