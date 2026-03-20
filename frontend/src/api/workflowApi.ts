import client from './client';
import type { WorkflowDTO } from '../types/workflow';

export const workflowApi = {
  list: () => client.get<WorkflowDTO[]>('/workflows').then(r => r.data),

  get: (id: string) => client.get<WorkflowDTO>(`/workflows/${id}`).then(r => r.data),

  create: (data: Partial<WorkflowDTO>) =>
    client.post<WorkflowDTO>('/workflows', data).then(r => r.data),

  update: (id: string, data: Partial<WorkflowDTO>) =>
    client.put<WorkflowDTO>(`/workflows/${id}`, data).then(r => r.data),

  delete: (id: string) => client.delete(`/workflows/${id}`),
};
