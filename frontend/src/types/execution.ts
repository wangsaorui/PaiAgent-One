export type NodeExecutionStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface NodeStatus {
  nodeId: string;
  nodeType: string;
  status: NodeExecutionStatus;
  output?: unknown;
  error?: string;
}

export interface ExecutionEvent {
  type: string;
  nodeId?: string;
  nodeType?: string;
  status?: string;
  output?: unknown;
  error?: string;
  timestamp: number;
}
