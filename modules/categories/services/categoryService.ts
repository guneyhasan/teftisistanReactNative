import apiClient from '@src/services/api/client';
import { Category, Question } from '@src/types';

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const { data } = await apiClient.get<Category[]>('/categories');
    return data;
  },

  async create(payload: { title: string }): Promise<Category> {
    const { data } = await apiClient.post<Category>('/categories', payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  },

  async createQuestion(payload: {
    text: string;
    categoryId: number;
    description?: string;
    points?: number;
    noteRequired?: boolean;
  }): Promise<Question> {
    const { data } = await apiClient.post<Question>('/questions', payload);
    return data;
  },

  async removeQuestion(id: number): Promise<void> {
    await apiClient.delete(`/questions/${id}`);
  },
};
