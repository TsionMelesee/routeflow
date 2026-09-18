// Envelope shapes every controller in the backend actually returns —
// see the "Response shape follows Step 4 §27" note in the backend README.

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiErrorBody {
  message: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message || "Something went wrong.");
    this.name = "ApiError";
    this.status = status;
    this.errors = body.errors;
  }

  /** First validation message for a given field, if the 422 named one. */
  fieldError(field: string): string | undefined {
    return this.errors?.[field]?.[0];
  }
}
