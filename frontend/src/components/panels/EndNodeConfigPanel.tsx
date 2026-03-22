import { useRef } from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import type { NodeConfig, OutputParam } from '../../types/workflow';

export default function EndNodeConfigPanel() {
  const { selectedNodeId, nodes, updateNodeConfig } = useWorkflowStore();
  const templateInputRef = useRef<HTMLTextAreaElement>(null);
  
  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node || node.type !== 'end-node') return null;

  const config = node.data.config as NodeConfig & { outputParams?: OutputParam[]; responseTemplate?: string };
  const outputParams = config.outputParams || [];
  const responseTemplate = config.responseTemplate || '';

  // 获取所有可引用的节点（除了当前节点和end-node）
  const referenceableNodes = nodes.filter(n => 
    n.id !== selectedNodeId && n.type !== 'end-node'
  );

  const handleAddParam = () => {
    const newParam: OutputParam = {
      name: '',
      type: 'input',
      value: ''
    };
    const newParams = [...outputParams, newParam];
    updateNodeConfig(selectedNodeId!, { outputParams: newParams });
  };

  const handleRemoveParam = (index: number) => {
    const newParams = outputParams.filter((_, i) => i !== index);
    updateNodeConfig(selectedNodeId!, { outputParams: newParams });
  };

  const handleParamChange = (index: number, field: keyof OutputParam, value: string) => {
    const newParams = [...outputParams];
    newParams[index] = { ...newParams[index], [field]: value };
    
    // 如果切换类型，重置相关字段
    if (field === 'type') {
      if (value === 'input') {
        newParams[index].referenceNodeId = undefined;
        newParams[index].referenceOutputKey = undefined;
      } else {
        newParams[index].value = '';
      }
    }
    
    updateNodeConfig(selectedNodeId!, { outputParams: newParams });
  };

  const handleTemplateChange = (value: string) => {
    updateNodeConfig(selectedNodeId!, { responseTemplate: value });
  };

  const insertParamToTemplate = (paramName: string) => {
    const template = responseTemplate || '';
    const cursorPosition = templateInputRef.current?.selectionStart || template.length;
    const newTemplate = template.slice(0, cursorPosition) + `{{${paramName}}}` + template.slice(cursorPosition);
    handleTemplateChange(newTemplate);
    
    // 重新聚焦并设置光标位置
    setTimeout(() => {
      templateInputRef.current?.focus();
      templateInputRef.current?.setSelectionRange(
        cursorPosition + paramName.length + 4,
        cursorPosition + paramName.length + 4
      );
    }, 0);
  };

  return (
    <div style={{ 
      padding: 16, 
      borderTop: '1px solid #e5e7eb',
      backgroundColor: 'white',
    }}>
      <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: '#374151' }}>
        输出配置
      </h4>
      
      {/* 输出参数列表 */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>输出参数</span>
          <button
            onClick={handleAddParam}
            style={{
              padding: '6px 12px',
              fontSize: 12,
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            + 添加
          </button>
        </div>
        
        {outputParams.length === 0 ? (
          <div style={{ 
            padding: '16px', 
            textAlign: 'center', 
            fontSize: 12, 
            color: '#9ca3af',
            backgroundColor: '#f9fafb',
            borderRadius: 6,
            border: '1px dashed #d1d5db'
          }}>
            点击"添加"按钮添加输出参数
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {outputParams.map((param, index) => (
              <div 
                key={index} 
                style={{ 
                  padding: 14, 
                  border: '1px solid #e5e7eb', 
                  borderRadius: 8, 
                  backgroundColor: '#fafafa'
                }}
              >
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>
                      <span>参数名</span>
                      <input
                        type="text"
                        value={param.name}
                        onChange={(e) => handleParamChange(index, 'name', e.target.value)}
                        placeholder="例如: result"
                        style={inputStyle}
                      />
                    </label>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>
                      <span>参数类型</span>
                      <select
                        value={param.type}
                        onChange={(e) => handleParamChange(index, 'type', e.target.value as 'input' | 'reference')}
                        style={inputStyle}
                      >
                        <option value="input">输入</option>
                        <option value="reference">引用</option>
                      </select>
                    </label>
                  </div>
                </div>
                
                {param.type === 'input' ? (
                  <label style={labelStyle}>
                    <span>值</span>
                    <input
                      type="text"
                      value={param.value}
                      onChange={(e) => handleParamChange(index, 'value', e.target.value)}
                      placeholder="输入值"
                      style={inputStyle}
                    />
                  </label>
                ) : (
                  <label style={labelStyle}>
                    <span>引用节点</span>
                    <select
                      value={param.referenceNodeId || ''}
                      onChange={(e) => handleParamChange(index, 'referenceNodeId', e.target.value)}
                      style={inputStyle}
                    >
                      <option value="">请选择节点</option>
                      {referenceableNodes.map(node => (
                        <option key={node.id} value={node.id}>
                          {node.data.label} ({node.id})
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                
                <button
                  onClick={() => handleRemoveParam(index)}
                  style={{
                    marginTop: 10,
                    padding: '5px 10px',
                    fontSize: 11,
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}
                >
                  删除此参数
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 回答内容配置 */}
      <div>
        <div style={{ marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>回答内容配置</span>
        </div>
        
        {outputParams.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>
              快速插入参数引用：
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {outputParams.map((param, index) => (
                param.name && (
                  <button
                    key={index}
                    onClick={() => insertParamToTemplate(param.name)}
                    style={{
                      padding: '4px 8px',
                      fontSize: 11,
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      border: '1px solid #93c5fd',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontFamily: 'monospace',
                    }}
                  >
                    {'{{' + param.name + '}}'}
                  </button>
                )
              ))}
            </div>
          </div>
        )}
        
        <textarea
          ref={templateInputRef}
          value={responseTemplate}
          onChange={(e) => handleTemplateChange(e.target.value)}
          placeholder="在这里配置回答内容，可以使用 {{参数名}} 引用输出参数"
          rows={5}
          style={{ 
            ...inputStyle, 
            width: '100%', 
            resize: 'vertical',
            fontFamily: 'monospace',
            minHeight: 100,
          }}
        />
        
        <div style={{ 
          marginTop: 8, 
          fontSize: 11, 
          color: '#6b7280',
          fontStyle: 'italic',
          lineHeight: 1.5,
        }}>
          提示：点击上方的参数按钮可快速插入参数引用，或手动输入 {'{{参数名}}'}
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