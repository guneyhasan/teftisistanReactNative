import apiClient from '@src/services/api/client';
import { Region, Company } from '@src/types';

export const regionService = {
  async getAll(companyId?: number): Promise<Region[]> {
    const { data } = await apiClient.get<Region[]>('/regions', {
      params: companyId ? { companyId } : undefined,
    });
    return data;
  },

  async create(payload: { name: string; companyId: number }): Promise<Region> {
    const { data } = await apiClient.post<Region>('/regions', payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/regions/${id}`);
  },

  async getCompanies(): Promise<Company[]> {
    const { data } = await apiClient.get<Company[]>('/companies');
    return data;
  },
};
