import { useCallback } from 'react';
import type { ExecutionEvent } from '../types/execution';
import { useExecutionStore } from '../store/executionStore';

export function useSSE() {
  const { updateNodeStatus, setAudioUrl, setError, setCompleted } = useExecutionStore();

  const connect = useCallback(
    (executionId: string) => {
      const es = new EventSource(`/api/executions/${executionId}/events`);

      const handleEvent = (e: MessageEvent) => {
        const data: ExecutionEvent = JSON.parse(e.data);

        switch (data.type) {
          case 'NODE_STARTED':
            if (data.nodeId && data.nodeType) {
              updateNodeStatus(data.nodeId, data.nodeType, 'running');
            }
            break;
          case 'NODE_COMPLETED':
            if (data.nodeId && data.nodeType) {
              updateNodeStatus(data.nodeId, data.nodeType, 'completed', data.output);
            }
            break;
          case 'NODE_FAILED':
            if (data.nodeId && data.nodeType) {
              updateNodeStatus(data.nodeId, data.nodeType, 'failed', undefined, data.error);
            }
            break;
          case 'EXECUTION_COMPLETED':
            if (data.output && typeof data.output === 'string') {
              setAudioUrl(data.output);
            }
            setCompleted();
            es.close();
            break;
          case 'EXECUTION_FAILED':
            setError(data.error || 'Execution failed');
            es.close();
            break;
        }
      };

      es.addEventListener('NODE_STARTED', handleEvent);
      es.addEventListener('NODE_COMPLETED', handleEvent);
      es.addEventListener('NODE_FAILED', handleEvent);
      es.addEventListener('EXECUTION_COMPLETED', handleEvent);
      es.addEventListener('EXECUTION_FAILED', handleEvent);

      es.onerror = () => {
        es.close();
      };

      return es;
    },
    [updateNodeStatus, setAudioUrl, setError, setCompleted]
  );

  return { connect };
}
