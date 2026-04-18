export interface ApiResponse<T> {
  status: number;
  message?: string;
  data?: T;
  paging?: PagingMetadata;
  error?: unknown;
}

export interface PagingMetadata {
  page: number;
  size: number;
  totalItem: number;
  totalPage: number;
}
