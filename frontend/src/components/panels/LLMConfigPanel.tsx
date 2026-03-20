import { useWorkflowStore } from '../../store/workflowStore';
import type { NodeConfig } from '../../types/workflow';

export default function LLMConfigPanel() {
  const { selectedNodeId, nodes, updateNodeConfig } = useWorkflowStore();

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node || node.type !== 'llm-node') return null;

  const config = node.data.config;

  const handleChange = (field: keyof NodeConfig, value: string | number) => {
    if (selectedNodeId) {
      updateNodeConfig(selectedNodeId, { [field]: value });
    }
  };

  return (
    <div style={{ padding: 16, borderTop: '1px solid #e5e7eb' }}>
      <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: '#374151' }}>
        大模型配置
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <label style={labelStyle}>
          <span>Provider</span>
          <select
            value={config.provider || 'openai'}
            onChange={(e) => handleChange('provider', e.target.value)}
            style={inputStyle}
          >
            <option value="openai">OpenAI</option>
            <option value="deepseek">DeepSeek</option>
            <option value="tongyi">通义千问</option>
          </select>
        </label>
        <label style={labelStyle}>
          <span>Model</span>
          <input
            type="text"
            value={config.model || ''}
            onChange={(e) => handleChange('model', e.target.value)}
            placeholder="gpt-4o / deepseek-chat / qwen-max"
            style={inputStyle}
          />
        </label>
        <label style={labelStyle}>
          <span>System Prompt</span>
          <textarea
            value={config.systemPrompt || ''}
            onChange={(e) => handleChange('systemPrompt', e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </label>
        <label style={labelStyle}>
          <span>Temperature: {config.temperature ?? 0.7}</span>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={config.temperature ?? 0.7}
            onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </label>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  fontSize: 12,
  color: '#6b7280',
};

const inputStyle: React.CSSProperties = {
  padding: '6px 8px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  fontSize: 12,
  outline: 'none',
};
