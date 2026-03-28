import apiClient from '@src/services/api/client';
import { User } from '@src/types';

export const userService = {
  async getAll(): Promise<User[]> {
    const { data } = await apiClient.get<User[]>('/users');
    return data;
  },

  async create(payload: { name: string; email: string; password: string; role: string }): Promise<User> {
    const { data } = await apiClient.post<User>('/users', payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
};
