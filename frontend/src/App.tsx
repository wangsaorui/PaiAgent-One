import { useEffect } from 'react';
import { ReactFlowProvider, type Node, type Edge } from '@xyflow/react';
import AppLayout from './components/layout/AppLayout';
import { useWorkflowStore } from './store/workflowStore';
import { defaultNodes, defaultEdges } from './components/canvas/defaultWorkflow';
import { workflowApi } from './api/workflowApi';
import type { WorkflowNodeData } from './types/workflow';

function App() {
  const { setNodes, setEdges, setWorkflowId, setWorkflowName } = useWorkflowStore();

  useEffect(() => {
    // 从URL中获取工作流ID
    const urlParams = new URLSearchParams(window.location.search);
    const workflowIdFromUrl = urlParams.get('workflowId');

    const loadWorkflow = async () => {
      try {
        // 如果URL中有工作流ID，优先加载该工作流
        if (workflowIdFromUrl) {
          const workflow = await workflowApi.get(workflowIdFromUrl);
          setWorkflowId(workflow.id);
          setWorkflowName(workflow.name);
          
          const def = workflow.definition;
          if (def && def.nodes) {
            const rfNodes = def.nodes.map((n) => ({
              id: n.id,
              type: n.type,
              position: n.position,
              data: {
                label: n.label || getDefaultLabel(n.type),
                nodeType: n.type,
                config: n.config || {},
              },
            })) as Node<WorkflowNodeData>[];
            
            const rfEdges = (def.edges || []).map((e) => ({
              id: e.id,
              source: e.source,
              sourceHandle: e.sourceHandle,
              target: e.target,
              targetHandle: e.targetHandle,
              animated: true,
            })) as Edge[];
            
            setNodes(rfNodes);
            setEdges(rfEdges);
          }
          return;
        }

        // 否则加载最近的工作流
        const workflows = await workflowApi.list();
        if (workflows.length > 0) {
          const latest = workflows[0];
          setWorkflowId(latest.id);
          setWorkflowName(latest.name);
          
          const def = latest.definition;
          if (def && def.nodes) {
            const rfNodes = def.nodes.map((n) => ({
              id: n.id,
              type: n.type,
              position: n.position,
              data: {
                label: n.label || getDefaultLabel(n.type),
                nodeType: n.type,
                config: n.config || {},
              },
            })) as Node<WorkflowNodeData>[];
            
            const rfEdges = (def.edges || []).map((e) => ({
              id: e.id,
              source: e.source,
              sourceHandle: e.sourceHandle,
              target: e.target,
              targetHandle: e.targetHandle,
              animated: true,
            })) as Edge[];
            
            setNodes(rfNodes);
            setEdges(rfEdges);
          }
          
          // 更新URL（不添加历史记录）
          window.history.replaceState(null, '', `?workflowId=${latest.id}`);
        } else {
          setNodes(defaultNodes);
          setEdges(defaultEdges);
        }
      } catch {
        // Backend not available, use defaults
        setNodes(defaultNodes);
        setEdges(defaultEdges);
      }
    };

    loadWorkflow();
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
