import type { NodeProps } from '@xyflow/react';
import BaseNode from './BaseNode';

export default function UserInputNode({ id }: NodeProps) {
  return (
    <BaseNode id={id} icon="&#128100;" label="用户输入" color="#6366f1" hasTarget={false}>
      <div style={{ fontSize: 12, color: '#9ca3af' }}>工作流入口，接收文本输入</div>
    </BaseNode>
  );
}
