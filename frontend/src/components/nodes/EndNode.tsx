import type { NodeProps } from '@xyflow/react';
import BaseNode from './BaseNode';

export default function EndNode({ id }: NodeProps) {
  return (
    <BaseNode id={id} icon="&#127937;" label="结束" color="#ef4444" hasSource={false}>
      <div style={{ fontSize: 12, color: '#9ca3af' }}>工作流结束</div>
    </BaseNode>
  );
}
