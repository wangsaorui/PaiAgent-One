import { create } from 'zustand';
import type { NodeStatus, NodeExecutionStatus } from '../types/execution';

interface ExecutionState {
  executionId: string | null;
  isRunning: boolean;
  nodeStatuses: Record<string, NodeStatus>;
  audioUrl: string | null;
  error: string | null;
  startExecution: (executionId: string) => void;
  updateNodeStatus: (
    nodeId: string,
    nodeType: string,
    status: NodeExecutionStatus,
    output?: unknown,
    error?: string
  ) => void;
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

  startExecution: (executionId) =>
    set({ executionId, isRunning: true, nodeStatuses: {}, audioUrl: null, error: null }),

  updateNodeStatus: (nodeId, nodeType, status, output, error) =>
    set((state) => ({
      nodeStatuses: {
        ...state.nodeStatuses,
        [nodeId]: { nodeId, nodeType, status, output, error },
      },
    })),

  setAudioUrl: (url) => set({ audioUrl: url }),
  setError: (error) => set({ error, isRunning: false }),
  setCompleted: () => set({ isRunning: false }),
  reset: () =>
    set({ executionId: null, isRunning: false, nodeStatuses: {}, audioUrl: null, error: null }),
}));
