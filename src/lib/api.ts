// Service API avec intercepteurs JWT

import type { ApiResponse, AuthTokens } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://olin-gravitational-waylon.ngrok-free.dev/api';

// Storage keys
const ACCESS_TOKEN_KEY = 'uici_access_token';
const REFRESH_TOKEN_KEY = 'uici_refresh_token';

// Token management
export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (tokens: AuthTokens) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  },
  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// Refresh token logic
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      tokenStorage.clearTokens();
      return null;
    }

    const data: ApiResponse<AuthTokens> = await response.json();
    if (data.success && data.data) {
      tokenStorage.setTokens(data.data);
      return data.data.accessToken;
    }
    return null;
  } catch {
    tokenStorage.clearTokens();
    return null;
  }
};

// Main API function
interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  requiresAuth?: boolean;
}

export async function api<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { body, requiresAuth = true, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // Add auth header if required
  if (requiresAuth) {
    const accessToken = tokenStorage.getAccessToken();
    if (accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
    }
  }

  const config: RequestInit = {
    ...fetchOptions,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle 401 - try to refresh token
    if (response.status === 401 && requiresAuth) {
      if (!isRefreshing) {
        isRefreshing = true;
        const newToken = await refreshAccessToken();
        isRefreshing = false;

        if (newToken) {
          onTokenRefreshed(newToken);
          // Retry original request with new token
          (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
          response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...config,
            headers,
          });
        } else {
          // Redirect to login
          window.location.href = '/login';
          return { success: false, error: { message: 'Session expirée' } };
        }
      } else {
        // Wait for token refresh
        return new Promise((resolve) => {
          subscribeTokenRefresh(async (token) => {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
            const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
              ...config,
              headers,
            });
            resolve(retryResponse.json());
          });
        });
      }
    }

    const data: ApiResponse<T> = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: { message: 'Erreur de connexion au serveur' },
    };
  }
}

// Convenience methods
export const apiGet = <T>(endpoint: string, options?: RequestOptions) =>
  api<T>(endpoint, { ...options, method: 'GET' });

export const apiPost = <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
  api<T>(endpoint, { ...options, method: 'POST', body });

export const apiPut = <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
  api<T>(endpoint, { ...options, method: 'PUT', body });

export const apiPatch = <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
  api<T>(endpoint, { ...options, method: 'PATCH', body });

export const apiDelete = <T>(endpoint: string, options?: RequestOptions) =>
  api<T>(endpoint, { ...options, method: 'DELETE' });
