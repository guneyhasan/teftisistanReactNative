import axios from 'axios';
import apiClient from '@src/services/api/client';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, CSRF_TOKEN_KEY, MASTER_API_URL, TENANT_API_URL_KEY } from '@src/configs/constants';
import { User } from '@src/types';

interface LoginResponse {
  user: User;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
}

export const authService = {
  async getTenantUrl(firmaKodu: string): Promise<string | null> {
    try {
      const { data } = await axios.get<{ apiUrl: string }>(`${MASTER_API_URL}/api/tenant-discovery`, {
        params: { code: firmaKodu },
      });
      return data.apiUrl;
    } catch {
      return null;
    }
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore logout errors; tokens are cleared client-side regardless
    } finally {
      await SecureStore.deleteItemAsync(CSRF_TOKEN_KEY);
    }
  },

  async getMe(): Promise<User> {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },

  /** Fetch loginOnly CSRF token (anonymous) - for login screen before auth */
  async getLoginCsrfToken(): Promise<string> {
    const tenantUrl = await SecureStore.getItemAsync(TENANT_API_URL_KEY);
    const baseUrl = tenantUrl || API_BASE_URL;
    const { data } = await axios.get<{ csrfToken: string }>(`${baseUrl}/auth/csrf-token`, {
      headers: { 'Content-Type': 'application/json' },
    });
    await SecureStore.setItemAsync(CSRF_TOKEN_KEY, data.csrfToken);
    return data.csrfToken;
  },

  /** Fetch userId-bound CSRF token (authenticated) - after login for POST/PUT/DELETE */
  async getAuthenticatedCsrfToken(): Promise<string> {
    const { data } = await apiClient.get<{ csrfToken: string }>('/auth/csrf-token');
    await SecureStore.setItemAsync(CSRF_TOKEN_KEY, data.csrfToken);
    return data.csrfToken;
  },
};
