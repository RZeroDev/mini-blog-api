export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface PaginationOptions {
  searchFields?: string[];
  defaultSortBy?: string;
  defaultSortOrder?: 'asc' | 'desc';
  defaultLimit?: number;
  include?: Record<string, boolean>;
  where?: Record<string, any>;
} 