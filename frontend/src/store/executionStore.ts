import { create } from 'zustand';
import type { NodeStatus, NodeExecutionStatus, ExecutionLog } from '../types/execution';

interface ExecutionState {
  executionId: string | null;
  isRunning: boolean;
  nodeStatuses: Record<string, NodeStatus>;
  audioUrl: string | null;
  error: string | null;
  logs: ExecutionLog[];
  startExecution: (executionId: string) => void;
  updateNodeStatus: (
    nodeId: string,
    nodeType: string,
    status: NodeExecutionStatus,
    output?: unknown,
    input?: unknown,
    error?: string
  ) => void;
  addLog: (log: Omit<ExecutionLog, 'id' | 'timestamp'>) => void;
  setAudioUrl: (url: string | null) => void;
  setError: (error: string | null) => void;
  setCompleted: () => void;
  reset: () => void;
}

export const useExecutionStore = create<ExecutionState>((set) => ({
  executionId: null,
  isRunning: false,
  nodeStatuses: {},
  audioUrl: null,
  error: null,
  logs: [],

  startExecution: (executionId) =>
    set({ 
      executionId, 
      isRunning: true, 
      nodeStatuses: {}, 
      audioUrl: null, 
      error: null, 
      logs: [] 
    }),

  updateNodeStatus: (nodeId, nodeType, status, output, input, error) =>
    set((state) => {
      const now = Date.now();
      const existingStatus = state.nodeStatuses[nodeId];
      
      const newStatus: NodeStatus = {
        nodeId,
        nodeType,
        status,
        output: output !== undefined ? output : existingStatus?.output,
        input: input !== undefined ? input : existingStatus?.input,
        error,
        startTime: status === 'running' ? now : existingStatus?.startTime,
        endTime: status === 'completed' || status === 'failed' ? now : existingStatus?.endTime,
        duration: (status === 'completed' || status === 'failed') && existingStatus?.startTime 
          ? now - existingStatus.startTime 
          : existingStatus?.duration,
      };

      return {
        nodeStatuses: {
          ...state.nodeStatuses,
          [nodeId]: newStatus,
        },
      };
    }),

  addLog: (log) =>
    set((state) => ({
      logs: [
        ...state.logs,
        {
          ...log,
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        },
      ],
    })),

  setAudioUrl: (url) => set({ audioUrl: url }),
  setError: (error) => set({ error, isRunning: false }),
  setCompleted: () => set({ isRunning: false }),
  reset: () =>
    set({ 
      executionId: null, 
      isRunning: false, 
      nodeStatuses: {}, 
      audioUrl: null, 
      error: null, 
      logs: [] 
    }),
}));
