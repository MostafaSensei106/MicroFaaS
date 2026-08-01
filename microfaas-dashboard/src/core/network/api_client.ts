import { AuthFailure, NetworkFailure, ServerFailure, ValidationFailure } from '../errors/failures';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  errors?: {
    code?: string;
    message?: string;
  };
  meta?: {
    page?: number;
    per_page?: number;
    total?: number;
    last_page?: number;
  };
}

export interface IApiClient {
  get<T>(path: string, headers?: Record<string, string>): Promise<T>;
  post<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T>;
  put<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T>;
  delete<T>(path: string, headers?: Record<string, string>): Promise<T>;
  setAuthToken(token: string | null): void;
}

export class FetchApiClient implements IApiClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = '/api/v1') {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.authToken = localStorage.getItem('faas_access_token');
    }
  }

  public setAuthToken(token: string | null): void {
    this.authToken = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('faas_access_token', token);
      } else {
        localStorage.removeItem('faas_access_token');
      }
    }
  }

  public getAuthToken(): string | null {
    if (!this.authToken && typeof window !== 'undefined') {
      this.authToken = localStorage.getItem('faas_access_token');
    }
    return this.authToken;
  }

  private getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(path: string, options: RequestInit): Promise<T> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    try {
      const response = await fetch(url, options);

      let json: ApiResponse<T>;
      try {
        json = await response.json();
      } catch {
        if (!response.ok) {
          throw new ServerFailure(`HTTP Error ${response.status}: ${response.statusText}`);
        }
        return {} as T;
      }

      if (!response.ok || (json && json.success === false)) {
        const errMsg = json?.errors?.message || `Request failed with status ${response.status}`;
        const errCode = json?.errors?.code || `${response.status}`;

        if (response.status === 401 || response.status === 403) {
          throw new AuthFailure(errMsg, errCode);
        }
        if (response.status === 400 || response.status === 422) {
          throw new ValidationFailure(errMsg, errCode);
        }
        throw new ServerFailure(errMsg, errCode);
      }

      // If backend wrapped in { success: true, data: T }
      if (json && 'data' in json && json.data !== undefined) {
        return json.data;
      }

      return json as unknown as T;
    } catch (err: unknown) {
      if (err instanceof AuthFailure || err instanceof ValidationFailure || err instanceof ServerFailure) {
        throw err;
      }
      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw new NetworkFailure('Failed to communicate with MicroFaaS Engine server.');
      }
      throw new ServerFailure(err instanceof Error ? err.message : 'Unknown network error');
    }
  }

  public async get<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(path, {
      method: 'GET',
      headers: this.getHeaders(headers),
    });
  }

  public async post<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      headers: this.getHeaders(headers),
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async put<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(path, {
      method: 'PUT',
      headers: this.getHeaders(headers),
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async delete<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(path, {
      method: 'DELETE',
      headers: this.getHeaders(headers),
    });
  }
}
