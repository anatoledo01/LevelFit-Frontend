export interface ApiErrorResponse {
  statusCode: number;
  error: string;
  message: string | string[];
  path?: string;
  timestamp?: string;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public error: string,
    public messages: string[],
  ) {
    super(messages.join(', '));
    this.name = 'ApiError';
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

async function fetchWithRefresh(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;

  let response = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Tenta renovar o token automaticamente se der 401 (exceto nas rotas de login/register/refresh)
  if (response.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register') && !url.includes('/auth/refresh')) {
    const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (refreshRes.ok) {
      // Re-executa a requisição original
      response = await fetch(fullUrl, {
        ...options,
        headers,
        credentials: 'include',
      });
    }
  }

  return response;
}

export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetchWithRefresh(url, options);
  } catch (error: any) {
    throw new ApiError(500, 'Network Error', [
      error.message || 'Falha de rede ou servidor indisponível',
    ]);
  }

  if (!res.ok) {
    let errorData: ApiErrorResponse;
    try {
      errorData = await res.json();
    } catch {
      errorData = {
        statusCode: res.status,
        error: res.statusText,
        message: 'Ocorreu um erro inesperado',
      };
    }

    const messages = Array.isArray(errorData.message) ? errorData.message : [errorData.message];
    throw new ApiError(errorData.statusCode, errorData.error, messages);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

// Convenient HTTP wrapper
export const http = {
  get: async <T>(url: string): Promise<{ data: T }> => {
    const data = await apiFetch<T>(`/api${url.startsWith('/') ? url : `/${url}`}`);
    return { data };
  },
  post: async <T>(url: string, body?: any): Promise<{ data: T }> => {
    const data = await apiFetch<T>(`/api${url.startsWith('/') ? url : `/${url}`}`, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
    return { data };
  },
  put: async <T>(url: string, body?: any): Promise<{ data: T }> => {
    const data = await apiFetch<T>(`/api${url.startsWith('/') ? url : `/${url}`}`, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
    return { data };
  },
  patch: async <T>(url: string, body?: any): Promise<{ data: T }> => {
    const data = await apiFetch<T>(`/api${url.startsWith('/') ? url : `/${url}`}`, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
    return { data };
  },
  delete: async <T>(url: string): Promise<{ data: T }> => {
    const data = await apiFetch<T>(`/api${url.startsWith('/') ? url : `/${url}`}`, {
      method: 'DELETE',
    });
    return { data };
  },
};
