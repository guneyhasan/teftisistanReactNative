import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, TOKEN_KEY, REFRESH_TOKEN_KEY, CSRF_TOKEN_KEY, TENANT_API_URL_KEY } from '@src/configs/constants';

const STATE_CHANGING_METHODS = ['post', 'put', 'patch', 'delete'];

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const tenantApiUrl = await SecureStore.getItemAsync(TENANT_API_URL_KEY);
  if (tenantApiUrl) {
    config.baseURL = tenantApiUrl;
  }

  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.headers && STATE_CHANGING_METHODS.includes((config.method || '').toLowerCase())) {
    const csrfToken = await SecureStore.getItemAsync(CSRF_TOKEN_KEY);
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }
  return config;
});

async function fetchAndStoreAuthenticatedCsrf(originalConfig?: InternalAxiosRequestConfig): Promise<string | null> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (!token) return null;
  try {
    const baseUrl = originalConfig?.baseURL || API_BASE_URL;
    const { data } = await axios.get<{ csrfToken: string }>(`${baseUrl}/auth/csrf-token`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    await SecureStore.setItemAsync(CSRF_TOKEN_KEY, data.csrfToken);
    return data.csrfToken;
  } catch {
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; _csrfRetry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, null, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });

        const newToken = data.accessToken || data.token;
        if (newToken) {
          await SecureStore.setItemAsync(TOKEN_KEY, newToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          processQueue(null, newToken);
          return apiClient(originalRequest);
        }
        throw new Error('No token in refresh response');
      } catch (refreshError) {
        processQueue(refreshError, null);
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }

    if (
      error.response?.status === 403 &&
      !originalRequest._csrfRetry &&
      STATE_CHANGING_METHODS.includes((originalRequest.method || '').toLowerCase()) &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/csrf-token')
    ) {
      const msg = (error.response?.data as { error?: string })?.error || '';
      if (msg.includes('CSRF')) {
        originalRequest._csrfRetry = true;
        const newCsrf = await fetchAndStoreAuthenticatedCsrf(originalRequest);
        if (newCsrf && originalRequest.headers) {
          originalRequest.headers['X-CSRF-Token'] = newCsrf;
          return apiClient(originalRequest);
        }
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
