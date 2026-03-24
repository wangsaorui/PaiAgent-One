import NodePaletteItem from './NodePaletteItem';
import LLMConfigPanel from '../panels/LLMConfigPanel';
import TTSConfigPanel from '../panels/TTSConfigPanel';
import UserInputConfigPanel from '../panels/UserInputConfigPanel';
import EndNodeConfigPanel from '../panels/EndNodeConfigPanel';
import { useWorkflowStore } from '../../store/workflowStore';

export default function NodeSidebar() {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const nodes = useWorkflowStore((s) => s.nodes);
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const showLLMConfig = selectedNode?.type === 'llm-node';
  const showTTSConfig = selectedNode?.type === 'tts-node';
  const showUserInputConfig = selectedNode?.type === 'user-input';
  const showEndNodeConfig = selectedNode?.type === 'end-node';

  return (
    <div
      style={{
        width: 320,
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
        <NodePaletteItem nodeType="user-input" label="用户输入" icon="&#128172;" color="#3b82f6" />
        <NodePaletteItem nodeType="llm-node" label="大模型" icon="&#129302;" color="#8b5cf6" />
        <NodePaletteItem
          nodeType="tts-node"
          label="超拟人音频合成"
          icon="&#127908;"
          color="#f59e0b"
        />
        <NodePaletteItem nodeType="end-node" label="结束" icon="&#127919;" color="#10b981" />
      </div>
      
      {/* 配置面板区域 - 添加滚动功能 */}
      <div 
        style={{ 
          flex: 1, 
          overflow: 'auto',
          overflowX: 'hidden',
          overflowY: 'auto',
        }}
      >
        {showLLMConfig && <LLMConfigPanel />}
        {showTTSConfig && <TTSConfigPanel />}
        {showUserInputConfig && <UserInputConfigPanel />}
        {showEndNodeConfig && <EndNodeConfigPanel />}
      </div>
    </div>
  );
}
