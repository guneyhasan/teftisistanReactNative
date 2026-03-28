import apiClient from '@src/services/api/client';
import { Audit, Category, Branch, Company, User, Answer, Photo } from '@src/types';

export interface AuditFilters {
  status?: string;
  companyId?: number;
  branchId?: number;
  userId?: string;
  search?: string;
}

export interface AuditScoreObject {
  percent: number;
  totalPoints?: number;
  earnedPoints?: number;
  byCategory?: unknown[];
}

export interface AuditDetailResponse {
  audit: Audit;
  score: number | AuditScoreObject;
}

export interface AnswerPayload {
  questionId: number;
  value: string;
  note?: string;
}

export const auditService = {
  async getAudits(filters?: AuditFilters): Promise<Audit[]> {
    const { data } = await apiClient.get<Audit[]>('/audits', { params: filters });
    return data;
  },

  async getAuditDetail(id: string): Promise<AuditDetailResponse> {
    const { data } = await apiClient.get<AuditDetailResponse>(`/audits/${id}`);
    return data;
  },

  async deleteAudit(id: string): Promise<void> {
    await apiClient.delete(`/audits/${id}`);
  },

  async startAudit(id: string): Promise<Audit> {
    const { data } = await apiClient.post<Audit>(`/audits/${id}/start`);
    return data;
  },

  async saveAnswers(id: string, items: AnswerPayload[]): Promise<void> {
    await apiClient.post(`/audits/${id}/answers`, { items });
  },

  async uploadPhoto(id: string, uri: string, questionId?: number): Promise<Photo> {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'photo.jpg';
    formData.append('file', { uri, name: filename, type: 'image/jpeg' } as unknown as Blob);
    if (questionId) formData.append('questionId', String(questionId));

    const { data } = await apiClient.post<Photo>(`/audits/${id}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async saveSignature(id: string, dataUrl: string, type: 'auditor' | 'client'): Promise<{ url: string }> {
    const { data } = await apiClient.post<{ url: string }>(`/audits/${id}/signature`, { dataUrl, type });
    return data;
  },

  async uploadSignatures(
    id: string,
    auditorUri: string,
    clientUri: string,
  ): Promise<{ message: string; urls: { auditor: string; client: string } }> {
    const formData = new FormData();
    formData.append('auditorSignature', { uri: auditorUri, name: 'auditor.png', type: 'image/png' } as unknown as Blob);
    formData.append('clientSignature', { uri: clientUri, name: 'client.png', type: 'image/png' } as unknown as Blob);

    const { data } = await apiClient.post(`/audits/${id}/signatures`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async submitAudit(id: string, authorizedPerson?: string): Promise<void> {
    await apiClient.post(`/audits/${id}/submit`, { authorizedPerson });
  },

  async useProfileSignature(id: string): Promise<{ url: string }> {
    const { data } = await apiClient.post<{ url: string }>(`/audits/${id}/signature/use-profile`);
    return data;
  },

  async reviewAudit(id: string, action: 'approve' | 'reject', note?: string): Promise<void> {
    await apiClient.post(`/audits/${id}/review`, { action, note });
  },

  async getCategories(): Promise<Category[]> {
    const { data } = await apiClient.get<Category[]>('/categories');
    return data;
  },

  async getCompanies(): Promise<Company[]> {
    const { data } = await apiClient.get<Company[]>('/companies');
    return data;
  },

  async getBranches(): Promise<Branch[]> {
    const { data } = await apiClient.get<Branch[]>('/branches');
    return data;
  },

  async getFieldUsers(): Promise<User[]> {
    const { data } = await apiClient.get<User[]>('/users', { params: { role: 'field' } });
    return data;
  },

  async submitCorrectiveActions(
    auditId: string,
    actions: Array<{ questionId: number; description?: string; photoUrls?: string[] }>,
  ): Promise<void> {
    await apiClient.post(`/audits/${auditId}/corrective-actions`, { actions });
  },
};
