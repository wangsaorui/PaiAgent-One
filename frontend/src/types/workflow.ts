export interface NodeConfig {
  provider?: string;
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  voice?: string;
  speed?: number;
  // LLM specific configs
  apiKey?: string;
  baseUrl?: string;
  // LLM input params (references to upstream node outputs)
  inputParams?: InputParam[];
  // LLM output variable definitions
  llmOutputParams?: LLMOutputParam[];
  // EndNode specific configs
  outputParams?: OutputParam[];
  responseTemplate?: string;
  [key: string]: unknown;
}

export interface LLMOutputParam {
  name: string;           // 变量名
  valueType: 'string';    // 变量类型，目前仅支持 string
  description?: string;   // 描述（可为空）
}

export interface InputParam {
  name: string;         // 参数名称，如 "user_input"
  type: 'input' | 'reference';
  value: string;        // type='input' 时为手动输入值
  referenceNodeId?: string;    // type='reference' 时引用的节点ID
  referenceOutputKey?: string; // type='reference' 时引用的输出key
}

export interface OutputParam {
  name: string;
  type: 'input' | 'reference';
  value: string; // For 'input' type, this is the manual input value
  referenceNodeId?: string; // For 'reference' type, this references another node's ID
  referenceOutputKey?: string; // For 'reference' type, this specifies which output to reference
}

export interface WorkflowNodeData {
  label: string;
  nodeType: string;
  config: NodeConfig;
  [key: string]: unknown; // 添加索引签名以兼容React Flow
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
  [key: string]: unknown; // 添加索引签名
}

export interface WorkflowEdge {
  id: string;
  source: string;
  sourceHandle?: string;
  target: string;
  targetHandle?: string;
  [key: string]: unknown; // 添加索引签名
}

export interface WorkflowDTO {
  id: string;
  name: string;
  definition: WorkflowDefinition;
  createdAt?: string;
  updatedAt?: string;
}
