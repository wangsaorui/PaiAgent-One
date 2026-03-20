export interface NodeConfig {
  provider?: string;
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  voice?: string;
  speed?: number;
  [key: string]: unknown;
}

export interface WorkflowNodeData {
  label: string;
  nodeType: string;
  config: NodeConfig;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: WorkflowNodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  sourceHandle?: string;
  target: string;
  targetHandle?: string;
}

export interface WorkflowDTO {
  id: string;
  name: string;
  definition: WorkflowDefinition;
  createdAt?: string;
  updatedAt?: string;
}
