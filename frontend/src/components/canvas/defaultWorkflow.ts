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
    type: 'llm-node',
    position: { x: 300, y: 200 },
    data: {
      label: '大模型',
      nodeType: 'llm-node',
      config: {
        provider: 'openai',
        model: 'gpt-4o',
        systemPrompt: '你是一个专业的播客主持人，请将用户输入的主题扩展为一段生动有趣的播客文稿。',
        temperature: 0.7,
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
            name: 'podcast_content',
            type: 'reference',
            value: '',
            referenceNodeId: 'node-2'
          }
        ],
        responseTemplate: '播客内容：{{podcast_content}}'
      }
    },
  },
];

export const defaultEdges: Edge[] = [
  { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true },
  { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true },
];
