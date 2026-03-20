import { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import AppLayout from './components/layout/AppLayout';
import { useWorkflowStore } from './store/workflowStore';
import { defaultNodes, defaultEdges } from './components/canvas/defaultWorkflow';
import { workflowApi } from './api/workflowApi';

function App() {
  const { setNodes, setEdges, setWorkflowId, setWorkflowName } = useWorkflowStore();

  useEffect(() => {
    // Try to load the most recent workflow, otherwise use defaults
    workflowApi
      .list()
      .then((workflows) => {
        if (workflows.length > 0) {
          const latest = workflows[0];
          setWorkflowId(latest.id);
          setWorkflowName(latest.name);
          const def = latest.definition;
          if (def && def.nodes) {
            // Map backend node format to ReactFlow node format
            const rfNodes = def.nodes.map((n: Record<string, unknown>) => ({
              id: n.id as string,
              type: n.type as string,
              position: n.position as { x: number; y: number },
              data: {
                label:
                  (n as Record<string, unknown>).label ||
                  getDefaultLabel(n.type as string),
                nodeType: n.type as string,
                config: (n as Record<string, unknown>).config || {},
              },
            }));
            const rfEdges = (def.edges || []).map((e: Record<string, unknown>) => ({
              id: e.id as string,
              source: e.source as string,
              sourceHandle: e.sourceHandle as string | undefined,
              target: e.target as string,
              targetHandle: e.targetHandle as string | undefined,
              animated: true,
            }));
            setNodes(rfNodes);
            setEdges(rfEdges);
          }
        } else {
          setNodes(defaultNodes);
          setEdges(defaultEdges);
        }
      })
      .catch(() => {
        // Backend not available, use defaults
        setNodes(defaultNodes);
        setEdges(defaultEdges);
      });
  }, [setNodes, setEdges, setWorkflowId, setWorkflowName]);

  return (
    <ReactFlowProvider>
      <AppLayout />
    </ReactFlowProvider>
  );
}

function getDefaultLabel(type: string): string {
  switch (type) {
    case 'user-input':
      return '用户输入';
    case 'llm-node':
      return '大模型';
    case 'tts-node':
      return '超拟人音频合成';
    case 'end-node':
      return '结束';
    default:
      return type;
  }
}

export default App;
