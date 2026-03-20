import type { NodeProps } from '@xyflow/react';
import BaseNode from './BaseNode';

export default function TTSNode({ id }: NodeProps) {
  return (
    <BaseNode id={id} icon="&#127908;" label="超拟人音频合成" color="#f59e0b">
      <div style={{ fontSize: 12, color: '#9ca3af' }}>将文本转为超拟人语音</div>
    </BaseNode>
  );
}
