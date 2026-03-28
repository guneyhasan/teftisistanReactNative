import apiClient from '@src/services/api/client';
import { Company, User } from '@src/types';

export const companyService = {
  async getAll(): Promise<Company[]> {
    const { data } = await apiClient.get<Company[]>('/companies');
    return data;
  },

  async create(payload: { name: string; ownerId?: string }): Promise<Company> {
    const { data } = await apiClient.post<Company>('/companies', payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/companies/${id}`);
  },

  async getOwners(): Promise<User[]> {
    const { data } = await apiClient.get<User[]>('/users', { params: { role: 'firma_sahibi' } });
    return data;
  },
};
