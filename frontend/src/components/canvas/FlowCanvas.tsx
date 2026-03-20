import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from '../nodes/nodeRegistry';
import { useWorkflowStore } from '../../store/workflowStore';
import type { WorkflowNodeData } from '../../types/workflow';

const nodeDefaults: Record<string, { label: string; config: Record<string, unknown> }> = {
  'llm-node': {
    label: '大模型',
    config: { provider: 'openai', model: 'gpt-4o', systemPrompt: '', temperature: 0.7 },
  },
  'tts-node': {
    label: '超拟人音频合成',
    config: { voice: 'default', speed: 1.0 },
  },
};

let nodeIdCounter = 100;

export default function FlowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, setSelectedNodeId } =
    useWorkflowStore();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData('application/reactflow-type');
      if (!nodeType || !nodeDefaults[nodeType]) return;

      const wrapperBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!wrapperBounds) return;

      const position = {
        x: event.clientX - wrapperBounds.left - 100,
        y: event.clientY - wrapperBounds.top - 20,
      };

      const defaults = nodeDefaults[nodeType];
      const newNode: Node<WorkflowNodeData> = {
        id: `node-${++nodeIdCounter}`,
        type: nodeType,
        position,
        data: {
          label: defaults.label,
          nodeType: nodeType,
          config: { ...defaults.config },
        },
      };

      addNode(newNode);
    },
    [addNode]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  return (
    <div ref={reactFlowWrapper} style={{ flex: 1, height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        style={{ background: '#f8fafc' }}
      >
        <Background gap={20} size={1} color="#e2e8f0" />
        <Controls />
        <MiniMap
          nodeStrokeWidth={3}
          pannable
          zoomable
          style={{ background: '#f1f5f9' }}
        />
      </ReactFlow>
    </div>
  );
}
