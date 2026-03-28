import apiClient from '@src/services/api/client';
import { Audit, Company } from '@src/types';

export const reportService = {
  async getAudits(params?: {
    startDate?: string;
    endDate?: string;
    companyId?: number;
    status?: string;
  }): Promise<Audit[]> {
    const { data } = await apiClient.get<Audit[]>('/audits', { params });
    return data;
  },

  async getCompanies(): Promise<Company[]> {
    const { data } = await apiClient.get<Company[]>('/companies');
    return data;
  },
};
