import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User } from '@src/types';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY, CSRF_TOKEN_KEY, TENANT_API_URL_KEY } from '@src/configs/constants';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tenantApiUrl: string | null;

  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setTenantApiUrl: (url: string) => Promise<void>;
  login: (user: User, token: string, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  hasRole: (...roles: string[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  tenantApiUrl: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setLoading: (isLoading) => set({ isLoading }),

  setTenantApiUrl: async (url) => {
    await SecureStore.setItemAsync(TENANT_API_URL_KEY, url);
    set({ tenantApiUrl: url });
  },

  login: async (user, token, refreshToken) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    if (refreshToken) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    }
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    await SecureStore.deleteItemAsync(CSRF_TOKEN_KEY);
    await SecureStore.deleteItemAsync(TENANT_API_URL_KEY);
    set({ user: null, isAuthenticated: false, isLoading: false, tenantApiUrl: null });
  },

  loadStoredAuth: async () => {
    try {
      const tenantUrl = await SecureStore.getItemAsync(TENANT_API_URL_KEY);
      if (tenantUrl) set({ tenantApiUrl: tenantUrl });

      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const userData = await SecureStore.getItemAsync(USER_KEY);
      if (token && userData) {
        const user = JSON.parse(userData) as User;
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  hasRole: (...roles) => {
    const { user } = get();
    if (!user) return false;
    return roles.includes(user.role);
  },
}));
