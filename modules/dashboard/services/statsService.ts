import apiClient from '@src/services/api/client';
import { StatsOverview, AnnualStat, Audit, User, Branch } from '@src/types';

export const statsService = {
  async getOverview(): Promise<StatsOverview> {
    const { data } = await apiClient.get<StatsOverview>('/stats/overview');
    return data;
  },

  async getAnnualStats(): Promise<AnnualStat[]> {
    const { data } = await apiClient.get<AnnualStat[]>('/stats/annual');
    return data;
  },

  async getRecentAudits(): Promise<Audit[]> {
    const { data } = await apiClient.get<Audit[]>('/audits');
    return data;
  },

  async getFieldUsers(): Promise<User[]> {
    const { data } = await apiClient.get<User[]>('/users', { params: { role: 'field' } });
    return data;
  },

  async getBranches(): Promise<Branch[]> {
    const { data } = await apiClient.get<Branch[]>('/branches');
    return data;
  },

  async createAudit(payload: { userId: string; branchId: number; title?: string; scheduledDate?: string }): Promise<Audit> {
    const { data } = await apiClient.post<Audit>('/audits', payload);
    return data;
  },
};
