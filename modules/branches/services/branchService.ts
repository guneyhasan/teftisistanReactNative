import apiClient from '@src/services/api/client';
import { Branch, Company, Region } from '@src/types';

export const branchService = {
  async getAll(params?: { companyId?: number; regionId?: number }): Promise<Branch[]> {
    const { data } = await apiClient.get<Branch[]>('/branches', { params });
    return data;
  },

  async create(payload: {
    name: string;
    city: string;
    companyId: number;
    regionId?: number;
    address?: string;
    phone?: string;
    email?: string;
  }): Promise<Branch> {
    const { data } = await apiClient.post<Branch>('/branches', payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/branches/${id}`);
  },

  async getCompanies(): Promise<Company[]> {
    const { data } = await apiClient.get<Company[]>('/companies');
    return data;
  },

  async getRegions(companyId?: number): Promise<Region[]> {
    const { data } = await apiClient.get<Region[]>('/regions', {
      params: companyId ? { companyId } : undefined,
    });
    return data;
  },
};
