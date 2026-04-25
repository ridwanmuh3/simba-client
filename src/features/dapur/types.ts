export interface Dapur {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export interface SelectDapurRequest {
  dapur_id: number;
}
