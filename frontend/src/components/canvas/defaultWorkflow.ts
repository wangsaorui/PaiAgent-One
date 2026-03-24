import type { Node, Edge } from '@xyflow/react';
import type { WorkflowNodeData } from '../../types/workflow';

export const defaultNodes: Node<WorkflowNodeData>[] = [
  {
    id: 'node-1',
    type: 'user-input',
    position: { x: 300, y: 50 },
    data: { label: '用户输入', nodeType: 'user-input', config: {} },
  },
  {
    id: 'node-2',
    type: 'tts-node',
    position: { x: 300, y: 200 },
    data: {
      label: '超拟人音频合成',
      nodeType: 'tts-node',
      config: {
        apiKey: '',
        model: 'qwen3-tts-flash',
        textParam: { name: 'text', type: 'reference', value: '', referenceNodeId: 'node-1', referenceOutputKey: 'user_input' },
        voice: 'Cherry',
        languageType: 'Auto',
      },
    },
  },
  {
    id: 'node-3',
    type: 'end-node',
    position: { x: 300, y: 400 },
    data: {
      label: '结束',
      nodeType: 'end-node',
      config: {
        outputParams: [
          {
            name: 'voice_url',
            type: 'reference',
            value: '',
            referenceNodeId: 'node-2'
          }
        ],
        responseTemplate: '音频文件：{{voice_url}}'
      }
    },
  },
];

export const defaultEdges: Edge[] = [
  { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true },
  { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true },
];
