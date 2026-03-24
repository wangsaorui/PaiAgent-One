import { create } from 'zustand';
import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import type { WorkflowNodeData, NodeConfig, WorkflowNode, WorkflowEdge } from '../types/workflow';

interface WorkflowState {
  workflowId: string | null;
  workflowName: string;
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  setWorkflowId: (id: string | null) => void;
  setWorkflowName: (name: string) => void;
  setNodes: (nodes: Node<WorkflowNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setSelectedNodeId: (id: string | null) => void;
  addNode: (node: Node<WorkflowNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  updateNodeConfig: (nodeId: string, config: Partial<NodeConfig>) => void;
  loadWorkflow: (id: string, name: string, workflowNodes: WorkflowNode[], workflowEdges: WorkflowEdge[]) => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflowId: null,
  workflowName: 'AI 播客工作流',
  nodes: [],
  edges: [],
  selectedNodeId: null,

  setWorkflowId: (id) => set({ workflowId: id }),
  setWorkflowName: (name) => set({ workflowName: name }),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) =>
    set({ nodes: applyNodeChanges(changes, get().nodes) as Node<WorkflowNodeData>[] }),
  onEdgesChange: (changes) =>
    set({ edges: applyEdgeChanges(changes, get().edges) }),
  onConnect: (connection) =>
    set({ edges: addEdge({ ...connection, animated: true }, get().edges) }),

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  addNode: (node) => set({ nodes: [...get().nodes, node] }),

  deleteNode: (nodeId) =>
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
    }),

  deleteEdge: (edgeId) =>
    set({
      edges: get().edges.filter((e) => e.id !== edgeId),
    }),

  updateNodeConfig: (nodeId, config) =>
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, config: { ...n.data.config, ...config } } }
          : n
      ),
    }),

  loadWorkflow: (id, name, workflowNodes, workflowEdges) => {
    // 将工作流节点转换为ReactFlow节点格式
    const rfNodes = workflowNodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: n.data,
    })) as Node<WorkflowNodeData>[];

    // 将工作流边转换为ReactFlow边格式
    const rfEdges = workflowEdges.map((e) => ({
      id: e.id,
      source: e.source,
      sourceHandle: e.sourceHandle,
      target: e.target,
      targetHandle: e.targetHandle,
      animated: true,
    })) as Edge[];

    // 更新store状态
    set({
      workflowId: id,
      workflowName: name,
      nodes: rfNodes,
      edges: rfEdges,
      selectedNodeId: null,
    });
  },
}));
