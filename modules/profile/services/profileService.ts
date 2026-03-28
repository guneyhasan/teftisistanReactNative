import apiClient from '@src/services/api/client';
import { API_BASE_URL } from '@src/configs/constants';

export const profileService = {
  async uploadPhoto(uri: string): Promise<{ url: string }> {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'photo.jpg';
    const mimeType = filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    formData.append('file', { uri, name: filename, type: mimeType } as unknown as Blob);

    const { data } = await apiClient.post<{ url: string }>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const baseUrl = API_BASE_URL.replace(/\/$/, '');
    const fullUrl = data.url.startsWith('/') ? `${baseUrl}${data.url}` : `${baseUrl}/${data.url}`;

    await apiClient.put('/profile', { profilePhoto: fullUrl });

    return { url: fullUrl };
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.put('/profile/password', { currentPassword, newPassword });
  },

  async saveSignature(dataUrl: string): Promise<{ url: string }> {
    const { data } = await apiClient.post<{ url: string }>('/profile/signature', { dataUrl });
    return data;
  },
};
