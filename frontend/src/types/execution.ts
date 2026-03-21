export type NodeExecutionStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface NodeStatus {
  nodeId: string;
  nodeType: string;
  status: NodeExecutionStatus;
  output?: unknown;
  input?: unknown;
  error?: string;
  startTime?: number;
  endTime?: number;
  duration?: number;
}

export interface ExecutionEvent {
  type: string;
  nodeId?: string;
  nodeType?: string;
  status?: string;
  output?: unknown;
  input?: unknown;
  error?: string;
  message?: string;
  timestamp: number;
}

export interface ExecutionLog {
  id: string;
  timestamp: number;
  type: 'info' | 'success' | 'error' | 'warning' | 'data';
  message: string;
  nodeId?: string;
  nodeName?: string;
  data?: unknown;
}
