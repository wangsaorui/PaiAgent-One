import { useWorkflowStore } from '../../store/workflowStore';
import type { NodeConfig, InputParam } from '../../types/workflow';

export default function TTSConfigPanel() {
  const { selectedNodeId, nodes, updateNodeConfig } = useWorkflowStore();

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node || node.type !== 'tts-node') return null;

  const config = node.data.config;
  const textParam: InputParam = (config.textParam as InputParam) || {
    name: 'text', type: 'reference', value: '',
    referenceNodeId: '', referenceOutputKey: '',
  };

  // 获取所有可引用的上游节点（排除自身和 end-node）
  const referenceableNodes = nodes.filter(
    (n) => n.id !== selectedNodeId && n.type !== 'end-node' && n.type !== 'tts-node'
  );

  const getNodeOutputKeys = (nodeId: string): string[] => {
    const n = nodes.find((nd) => nd.id === nodeId);
    if (!n) return [];
    if (n.type === 'user-input') return ['user_input'];
    if (n.type === 'llm-node') return ['output'];
    return ['output'];
  };

  const handleChange = (field: keyof NodeConfig, value: string | number) => {
    if (selectedNodeId) {
      updateNodeConfig(selectedNodeId, { [field]: value });
    }
  };

  const handleTextParamChange = (updates: Partial<InputParam>) => {
    const updated = { ...textParam, ...updates };
    if (updates.type === 'input') {
      updated.referenceNodeId = undefined;
      updated.referenceOutputKey = undefined;
    }
    if (updates.type === 'reference') {
      updated.value = '';
    }
    updateNodeConfig(selectedNodeId!, { textParam: updated });
  };

  return (
    <div style={{
      padding: 16,
      borderTop: '1px solid #e5e7eb',
      backgroundColor: 'white',
    }}>
      {/* 基本信息 */}
      <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: '#374151' }}>
        基本信息
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>

        {/* API Key */}
        <label style={labelStyle}>
          <span>API 密钥</span>
          <input
            type="password"
            value={(config.apiKey as string) || ''}
            onChange={(e) => handleChange('apiKey', e.target.value)}
            placeholder="sk-..."
            style={inputStyle}
          />
          <span style={helpTextStyle}>您的通义千问 API Key（DashScope）</span>
        </label>

        {/* Model */}
        <label style={labelStyle}>
          <span>模型名称</span>
          <input
            type="text"
            value={(config.model as string) || 'qwen3-tts-flash'}
            onChange={(e) => handleChange('model', e.target.value)}
            placeholder="qwen3-tts-flash"
            style={inputStyle}
          />
          <span style={helpTextStyle}>推荐: qwen3-tts-flash</span>
        </label>

      </div>

      {/* 分隔线 */}
      <div style={{ borderTop: '1px solid #e5e7eb', margin: '12px 0' }} />

      {/* 输入配置 */}
      <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: '#374151' }}>
        输入配置
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* text 参数 */}
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: 12,
          backgroundColor: '#fafafa',
        }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
            text <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>- 合成文本</span>
          </div>

          {/* 来源选择 */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: '#6b7280', minWidth: 40 }}>来源</span>
            <select
              value={textParam.type}
              onChange={(e) => handleTextParamChange({ type: e.target.value as 'input' | 'reference' })}
              style={{ ...inputStyle, flex: 1, padding: '4px 8px', fontSize: 12 }}
            >
              <option value="reference">引用节点输出</option>
              <option value="input">手动输入</option>
            </select>
          </div>

          {textParam.type === 'reference' && (
            <>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#6b7280', minWidth: 40 }}>节点</span>
                <select
                  value={textParam.referenceNodeId || ''}
                  onChange={(e) => {
                    const keys = getNodeOutputKeys(e.target.value);
                    handleTextParamChange({
                      referenceNodeId: e.target.value,
                      referenceOutputKey: keys[0] || '',
                    });
                  }}
                  style={{ ...inputStyle, flex: 1, padding: '4px 8px', fontSize: 12 }}
                >
                  <option value="">-- 选择节点 --</option>
                  {referenceableNodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {(n.data.label as string) || n.id}
                    </option>
                  ))}
                </select>
              </div>

              {textParam.referenceNodeId && (
                <div style={{
                  padding: '4px 8px',
                  backgroundColor: '#ede9fe',
                  borderRadius: 4,
                  fontSize: 11,
                  color: '#6d28d9',
                }}>
                  引用: {nodes.find(n => n.id === textParam.referenceNodeId)?.data.label || textParam.referenceNodeId}
                  .{textParam.referenceOutputKey || 'output'}
                </div>
              )}
            </>
          )}

          {textParam.type === 'input' && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#6b7280', minWidth: 40 }}>文本</span>
              <textarea
                value={textParam.value}
                onChange={(e) => handleTextParamChange({ value: e.target.value })}
                style={{ ...inputStyle, flex: 1, padding: '6px 8px', fontSize: 12, resize: 'vertical', minHeight: 60 }}
                placeholder="输入要合成的文本..."
              />
            </div>
          )}
        </div>

        {/* voice 参数 */}
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: 12,
          backgroundColor: '#fafafa',
        }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
            voice <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>- 音色</span>
          </div>
          <select
            value={(config.voice as string) || 'Cherry'}
            onChange={(e) => handleChange('voice', e.target.value)}
            style={inputStyle}
          >
            <option value="Cherry">Cherry</option>
            <option value="Serena">Serena</option>
            <option value="Ethan">Ethan</option>
          </select>
        </div>

        {/* language_type 参数 */}
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: 12,
          backgroundColor: '#fafafa',
        }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
            language_type <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>- 语言类型</span>
          </div>
          <select
            value={(config.languageType as string) || 'Auto'}
            onChange={(e) => handleChange('languageType', e.target.value)}
            style={inputStyle}
          >
            <option value="Auto">Auto</option>
          </select>
        </div>

      </div>

      {/* 分隔线 */}
      <div style={{ borderTop: '1px solid #e5e7eb', margin: '12px 0' }} />

      {/* 输出配置 */}
      <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: '#374151' }}>
        输出配置
      </h4>
      <div style={{
        border: '1px solid #d1fae5',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#f0fdf4',
      }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
          voice_url
        </div>
        <div style={{ fontSize: 11, color: '#6b7280' }}>
          生成的音频文件 URL，可被下游节点引用
        </div>
      </div>

    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontSize: 12,
  color: '#6b7280',
};

const inputStyle: React.CSSProperties = {
  padding: '8px 10px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  fontSize: 13,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

const helpTextStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#9ca3af',
  marginTop: 2,
};
