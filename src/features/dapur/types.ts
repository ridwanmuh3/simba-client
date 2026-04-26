export interface Dapur {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface SelectDapurRequest {
  dapur_id: number;
}

export interface CreateDapurRequest {
  name: string;
  description?: string;
}

export interface UpdateDapurRequest {
  id: number;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface DeleteDapurRequest {
  id: number;
}
