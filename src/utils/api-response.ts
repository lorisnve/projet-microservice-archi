export interface PaginationMeta {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface ApiResponseBody<T = unknown> {
  data: T | null;
  message: string;
  status: number;
  timestamp: string;
  pagination?: PaginationMeta;
  errors?: string[];
}

export class ApiResponse {
  static success<T>(data: T, message: string, status = 200): ApiResponseBody<T> {
    return {
      data,
      message,
      status,
      timestamp: new Date().toISOString(),
    };
  }

  static paginated<T>(
    data: T[],
    pagination: PaginationMeta,
    message = 'Succès',
  ): ApiResponseBody<T[]> {
    return {
      data,
      message,
      status: 200,
      timestamp: new Date().toISOString(),
      pagination,
    };
  }

  static error(message: string, status = 500, errors?: string[]): ApiResponseBody<never> {
    return {
      data: null,
      message,
      status,
      timestamp: new Date().toISOString(),
      ...(errors?.length ? { errors } : {}),
    };
  }
}
