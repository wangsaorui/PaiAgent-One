import NodePaletteItem from './NodePaletteItem';
import LLMConfigPanel from '../panels/LLMConfigPanel';
import { useWorkflowStore } from '../../store/workflowStore';

export default function NodeSidebar() {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const nodes = useWorkflowStore((s) => s.nodes);
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const showLLMConfig = selectedNode?.type === 'llm-node';

  return (
    <div
      style={{
        width: 240,
        height: '100%',
        borderRight: '1px solid #e5e7eb',
        background: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '16px 14px 8px', fontSize: 13, fontWeight: 600, color: '#6b7280' }}>
        节点面板
      </div>
      <div style={{ padding: '0 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <NodePaletteItem nodeType="llm-node" label="大模型" icon="&#129302;" color="#8b5cf6" />
        <NodePaletteItem
          nodeType="tts-node"
          label="超拟人音频合成"
          icon="&#127908;"
          color="#f59e0b"
        />
      </div>
      {showLLMConfig && <LLMConfigPanel />}
    </div>
  );
}
