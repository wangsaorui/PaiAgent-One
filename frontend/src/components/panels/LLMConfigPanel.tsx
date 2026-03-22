import { useWorkflowStore } from '../../store/workflowStore';
import type { NodeConfig, InputParam, LLMOutputParam } from '../../types/workflow';

export default function LLMConfigPanel() {
  const { selectedNodeId, nodes, updateNodeConfig } = useWorkflowStore();

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node || node.type !== 'llm-node') return null;

  const config = node.data.config;
  const provider = config.provider || 'openai';
  const inputParams: InputParam[] = (config.inputParams as InputParam[]) || [];
  const llmOutputParams: LLMOutputParam[] = (config.llmOutputParams as LLMOutputParam[]) || [];

  // 获取工作流中所有可引用的上游节点（用户输入节点等）
  const referenceableNodes = nodes.filter((n) => n.type === 'user-input');

  const handleChange = (field: keyof NodeConfig, value: string | number) => {
    if (selectedNodeId) {
      updateNodeConfig(selectedNodeId, { [field]: value });
    }
  };

  // ── 输入参数处理 ──
  const handleAddInputParam = () => {
    const newParam: InputParam = {
      name: 'user_input',
      type: 'reference',
      value: '',
      referenceNodeId: referenceableNodes[0]?.id || '',
      referenceOutputKey: 'user_input',
    };
    updateNodeConfig(selectedNodeId!, {
      inputParams: [...inputParams, newParam],
    });
  };

  const handleUpdateInputParam = (index: number, updates: Partial<InputParam>) => {
    const updated = inputParams.map((p, i) =>
      i === index ? { ...p, ...updates } : p
    );
    updateNodeConfig(selectedNodeId!, { inputParams: updated });
  };

  const handleRemoveInputParam = (index: number) => {
    const updated = inputParams.filter((_, i) => i !== index);
    updateNodeConfig(selectedNodeId!, { inputParams: updated });
  };

  // ── 输出参数处理 ──
  const handleAddOutputParam = () => {
    const newParam: LLMOutputParam = {
      name: 'output',
      valueType: 'string',
      description: '',
    };
    updateNodeConfig(selectedNodeId!, {
      llmOutputParams: [...llmOutputParams, newParam],
    });
  };

  const handleUpdateOutputParam = (index: number, updates: Partial<LLMOutputParam>) => {
    const updated = llmOutputParams.map((p, i) =>
      i === index ? { ...p, ...updates } : p
    );
    updateNodeConfig(selectedNodeId!, { llmOutputParams: updated });
  };

  const handleRemoveOutputParam = (index: number) => {
    const updated = llmOutputParams.filter((_, i) => i !== index);
    updateNodeConfig(selectedNodeId!, { llmOutputParams: updated });
  };

  // 获取某节点的可引用输出key列表
  const getNodeOutputKeys = (nodeId: string): string[] => {
    const n = nodes.find((nd) => nd.id === nodeId);
    if (!n) return [];
    if (n.type === 'user-input') return ['user_input'];
    return [];
  };

  return (
    <div style={{
      padding: 16,
      borderTop: '1px solid #e5e7eb',
      backgroundColor: 'white',
    }}>
      <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: '#374151' }}>
        大模型配置
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Provider选择 */}
        <label style={labelStyle}>
          <span>Provider</span>
          <select
            value={provider}
            onChange={(e) => handleChange('provider', e.target.value)}
            style={inputStyle}
          >
            <option value="openai">OpenAI</option>
            <option value="deepseek">DeepSeek</option>
            <option value="tongyi">通义千问</option>
          </select>
        </label>

        {/* DeepSeek专属配置 */}
        {provider === 'deepseek' && (
          <>
            <label style={labelStyle}>
              <span>接口地址</span>
              <input
                type="text"
                value={config.baseUrl || ''}
                onChange={(e) => handleChange('baseUrl', e.target.value)}
                placeholder="https://api.deepseek.com"
                style={inputStyle}
              />
              <span style={helpTextStyle}>DeepSeek API的基础URL地址</span>
            </label>

            <label style={labelStyle}>
              <span>API 密钥</span>
              <input
                type="password"
                value={config.apiKey || ''}
                onChange={(e) => handleChange('apiKey', e.target.value)}
                placeholder="sk-..."
                style={inputStyle}
              />
              <span style={helpTextStyle}>您的DeepSeek API密钥</span>
            </label>
          </>
        )}

        {/* 通义千问专属配置 */}
        {provider === 'tongyi' && (
          <>
            <label style={labelStyle}>
              <span>接口地址</span>
              <input
                type="text"
                value={config.baseUrl || ''}
                onChange={(e) => handleChange('baseUrl', e.target.value)}
                placeholder="https://dashscope.aliyuncs.com/compatible-mode/v1"
                style={inputStyle}
              />
              <span style={helpTextStyle}>通义千问 API的基础URL地址（兼容OpenAI格式）</span>
            </label>

            <label style={labelStyle}>
              <span>API 密钥</span>
              <input
                type="password"
                value={config.apiKey || ''}
                onChange={(e) => handleChange('apiKey', e.target.value)}
                placeholder="sk-..."
                style={inputStyle}
              />
              <span style={helpTextStyle}>您的通义千问 API Key（DashScope）</span>
            </label>
          </>
        )}

        {/* Model配置 */}
        <label style={labelStyle}>
          <span>Model</span>
          <input
            type="text"
            value={config.model || ''}
            onChange={(e) => handleChange('model', e.target.value)}
            placeholder={
              provider === 'openai' ? 'gpt-4o / gpt-3.5-turbo' :
              provider === 'deepseek' ? 'deepseek-chat / deepseek-coder' :
              'qwen-max / qwen-plus'
            }
            style={inputStyle}
          />
          {provider === 'deepseek' && (
            <span style={helpTextStyle}>推荐: deepseek-chat 或 deepseek-coder</span>
          )}
          {provider === 'tongyi' && (
            <span style={helpTextStyle}>推荐: qwen-max, qwen-plus, qwen-turbo</span>
          )}
        </label>

        {/* 输入参数 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>输入参数</span>
            <button
              onClick={handleAddInputParam}
              disabled={referenceableNodes.length === 0}
              style={{
                padding: '3px 10px',
                fontSize: 11,
                border: '1px solid #6366f1',
                borderRadius: 4,
                backgroundColor: referenceableNodes.length === 0 ? '#f3f4f6' : 'white',
                color: referenceableNodes.length === 0 ? '#9ca3af' : '#6366f1',
                cursor: referenceableNodes.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              + 添加
            </button>
          </div>

          {referenceableNodes.length === 0 && inputParams.length === 0 && (
            <div style={{ fontSize: 11, color: '#9ca3af', padding: '8px', backgroundColor: '#f9fafb', borderRadius: 4, border: '1px dashed #e5e7eb' }}>
              工作流中暂无可引用的输入节点
            </div>
          )}

          {inputParams.map((param, index) => (
            <div
              key={index}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                padding: 10,
                marginBottom: 8,
                backgroundColor: '#f9fafb',
              }}
            >
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: '#6b7280', minWidth: 40 }}>参数名</span>
                <input
                  type="text"
                  value={param.name}
                  onChange={(e) => handleUpdateInputParam(index, { name: e.target.value })}
                  style={{ ...inputStyle, flex: 1, padding: '4px 8px', fontSize: 12 }}
                  placeholder="参数名"
                />
                <button
                  onClick={() => handleRemoveInputParam(index)}
                  style={{
                    padding: '3px 8px',
                    fontSize: 11,
                    border: '1px solid #fca5a5',
                    borderRadius: 4,
                    backgroundColor: 'white',
                    color: '#ef4444',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  删除
                </button>
              </div>

              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: '#6b7280', minWidth: 40 }}>来源</span>
                <select
                  value={param.type}
                  onChange={(e) => handleUpdateInputParam(index, { type: e.target.value as 'input' | 'reference' })}
                  style={{ ...inputStyle, flex: 1, padding: '4px 8px', fontSize: 12 }}
                >
                  <option value="reference">引用节点输出</option>
                  <option value="input">手动输入</option>
                </select>
              </div>

              {param.type === 'reference' && (
                <>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: '#6b7280', minWidth: 40 }}>节点</span>
                    <select
                      value={param.referenceNodeId || ''}
                      onChange={(e) => {
                        const keys = getNodeOutputKeys(e.target.value);
                        handleUpdateInputParam(index, {
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

                  {param.referenceNodeId && (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#6b7280', minWidth: 40 }}>字段</span>
                      <select
                        value={param.referenceOutputKey || ''}
                        onChange={(e) => handleUpdateInputParam(index, { referenceOutputKey: e.target.value })}
                        style={{ ...inputStyle, flex: 1, padding: '4px 8px', fontSize: 12 }}
                      >
                        {getNodeOutputKeys(param.referenceNodeId).map((key) => (
                          <option key={key} value={key}>{key}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {param.referenceNodeId && param.referenceOutputKey && (
                    <div style={{
                      marginTop: 6,
                      padding: '4px 8px',
                      backgroundColor: '#ede9fe',
                      borderRadius: 4,
                      fontSize: 11,
                      color: '#6d28d9',
                    }}>
                      引用: {nodes.find(n => n.id === param.referenceNodeId)?.data.label || param.referenceNodeId}.{param.referenceOutputKey}
                    </div>
                  )}
                </>
              )}

              {param.type === 'input' && (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#6b7280', minWidth: 40 }}>值</span>
                  <input
                    type="text"
                    value={param.value}
                    onChange={(e) => handleUpdateInputParam(index, { value: e.target.value })}
                    style={{ ...inputStyle, flex: 1, padding: '4px 8px', fontSize: 12 }}
                    placeholder="输入参数值..."
                  />
                </div>
              )}
            </div>
          ))}

          {inputParams.length > 0 && (
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
              输入参数会作为用户消息传递给大模型
            </div>
          )}
        </div>

        {/* System Prompt */}
        <label style={labelStyle}>
          <span>System Prompt</span>
          <textarea
            value={config.systemPrompt || ''}
            onChange={(e) => handleChange('systemPrompt', e.target.value)}
            rows={4}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
            placeholder="输入系统提示词..."
          />
        </label>

        {/* Temperature */}
        <label style={labelStyle}>
          <span>Temperature: {config.temperature ?? 0.7}</span>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={config.temperature ?? 0.7}
            onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
            style={{ width: '100%', marginTop: 4 }}
          />
          <span style={helpTextStyle}>
            控制输出的随机性，值越高输出越随机，值越低输出越确定
          </span>
        </label>

        {/* 输出参数 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>输出参数</span>
            <button
              onClick={handleAddOutputParam}
              style={{
                padding: '3px 10px',
                fontSize: 11,
                border: '1px solid #059669',
                borderRadius: 4,
                backgroundColor: 'white',
                color: '#059669',
                cursor: 'pointer',
              }}
            >
              + 添加
            </button>
          </div>

          {llmOutputParams.length === 0 && (
            <div style={{ fontSize: 11, color: '#9ca3af', padding: '8px', backgroundColor: '#f9fafb', borderRadius: 4, border: '1px dashed #e5e7eb' }}>
              定义输出变量，供下游节点引用
            </div>
          )}

          {llmOutputParams.map((param, index) => (
            <div
              key={index}
              style={{
                border: '1px solid #d1fae5',
                borderRadius: 6,
                padding: 10,
                marginBottom: 8,
                backgroundColor: '#f0fdf4',
              }}
            >
              {/* 变量名 + 删除按钮 */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: '#6b7280', minWidth: 40 }}>变量名</span>
                <input
                  type="text"
                  value={param.name}
                  onChange={(e) => handleUpdateOutputParam(index, { name: e.target.value })}
                  style={{ ...inputStyle, flex: 1, padding: '4px 8px', fontSize: 12 }}
                  placeholder="如: llm_output"
                />
                <button
                  onClick={() => handleRemoveOutputParam(index)}
                  style={{
                    padding: '3px 8px',
                    fontSize: 11,
                    border: '1px solid #fca5a5',
                    borderRadius: 4,
                    backgroundColor: 'white',
                    color: '#ef4444',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  删除
                </button>
              </div>

              {/* 变量类型（只读，固定为 string） */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: '#6b7280', minWidth: 40 }}>类型</span>
                <div style={{
                  ...inputStyle,
                  flex: 1,
                  padding: '4px 8px',
                  fontSize: 12,
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  cursor: 'default',
                }}>
                  String
                </div>
              </div>

              {/* 描述（可为空） */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#6b7280', minWidth: 40 }}>描述</span>
                <input
                  type="text"
                  value={param.description || ''}
                  onChange={(e) => handleUpdateOutputParam(index, { description: e.target.value })}
                  style={{ ...inputStyle, flex: 1, padding: '4px 8px', fontSize: 12 }}
                  placeholder="可选，说明该输出的含义..."
                />
              </div>
            </div>
          ))}

          {llmOutputParams.length > 0 && (
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
              输出变量可被下游节点作为引用参数使用
            </div>
          )}
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
