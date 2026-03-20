import type { NodeProps, Node } from '@xyflow/react';
import BaseNode from './BaseNode';
import type { WorkflowNodeData } from '../../types/workflow';

export default function LLMNode({ id, data }: NodeProps<Node<WorkflowNodeData>>) {
  const config = data.config;
  const provider = config.provider || 'openai';
  const model = config.model || '-';

  return (
    <BaseNode id={id} icon="&#129302;" label="大模型" color="#8b5cf6">
      <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span>
          <strong>Provider:</strong> {provider}
        </span>
        <span>
          <strong>Model:</strong> {model}
        </span>
      </div>
    </BaseNode>
  );
}
