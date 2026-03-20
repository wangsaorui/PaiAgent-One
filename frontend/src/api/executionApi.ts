import client from './client';

export const executionApi = {
  start: (workflowId: string, inputText: string) =>
    client
      .post<{ executionId: string; status: string }>('/executions', {
        workflowId,
        inputText,
      })
      .then(r => r.data),

  get: (id: string) => client.get(`/executions/${id}`).then(r => r.data),

  createEventSource: (executionId: string) =>
    new EventSource(`/api/executions/${executionId}/events`),
};
