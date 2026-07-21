import api from '../config/api';
import type { Category } from '../types/task';

export async function fetchCategories(): Promise<Category[]> {
  const response = await api.get<Category[]>('/categories');
  return response.data;
}
