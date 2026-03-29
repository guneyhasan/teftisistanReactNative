import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, TOKEN_KEY, TENANT_API_URL_KEY } from '@src/configs/constants';

/**
 * Converts relative image URL to full absolute URL.
 * If url already starts with http/https, returns as-is.
 */
export function getFullImageUrl(url: string, baseUrl?: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const base = (baseUrl || API_BASE_URL).replace(/\/$/, '');
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
}

export interface ImageSource {
  uri: string;
  headers?: Record<string, string>;
}

/**
 * Returns Image source with full URL and auth headers for authenticated uploads.
 * Backend /uploads route requires Bearer token.
 */
export async function getImageSource(url: string): Promise<ImageSource> {
  const tenantUrl = await SecureStore.getItemAsync(TENANT_API_URL_KEY);
  const uri = getFullImageUrl(url, tenantUrl || undefined);
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  const source: ImageSource = { uri };
  if (token) {
    source.headers = { Authorization: `Bearer ${token}` };
  }
  return source;
}
