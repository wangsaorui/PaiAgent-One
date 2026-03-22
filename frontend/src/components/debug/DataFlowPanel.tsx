import { useState } from 'react';
import type { NodeStatus } from '../../types/execution';

interface DataFlowPanelProps {
  nodeStatuses: Record<string, NodeStatus>;
  nodeOrder: { id: string; label: string }[];
}

export default function DataFlowPanel({ nodeStatuses, nodeOrder }: DataFlowPanelProps) {
  const [expandedNode, setExpandedNode] = useState<string | null>(null);

  if (nodeOrder.length === 0) {
    return null;
  }

  const toggleNode = (nodeId: string) => {
    setExpandedNode(expandedNode === nodeId ? null : nodeId);
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
    }}>
      <div style={{
        fontSize: 13,
        fontWeight: 600,
        color: '#374151',
        marginBottom: 8,
      }}>
        数据流转
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        {nodeOrder.map((node, index) => {
          const status = nodeStatuses[node.id];
          const isExpanded = expandedNode === node.id;
          const hasData = Boolean(status?.input) || Boolean(status?.output);

          return (
            <div key={node.id}>
              {/* 数据流连接线 */}
              {index > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px 0',
                  marginLeft: 12,
                }}>
                  <div style={{
                    width: 2,
                    height: 16,
                    backgroundColor: nodeStatuses[nodeOrder[index - 1].id]?.status === 'completed' 
                      ? '#22c55e' 
                      : '#e5e7eb',
                  }} />
                  <div style={{
                    marginLeft: 8,
                    fontSize: 10,
                    color: '#9ca3af',
                  }}>
                    ↓ 数据流
                  </div>
                </div>
              )}

              {/* 节点数据卡片 */}
              <div
                onClick={() => hasData && toggleNode(node.id)}
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  cursor: hasData ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  opacity: status?.status ? 1 : 0.5,
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: 
                        status?.status === 'completed' ? '#22c55e' :
                        status?.status === 'running' ? '#3b82f6' :
                        status?.status === 'failed' ? '#ef4444' : '#e5e7eb',
                    }} />
                    <span style={{ 
                      fontSize: 13, 
                      fontWeight: 500,
                      color: '#374151',
                    }}>
                      {node.label}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {status?.duration && (
                      <span style={{
                        fontSize: 10,
                        color: '#6b7280',
                        backgroundColor: '#f3f4f6',
                        padding: '2px 6px',
                        borderRadius: 4,
                      }}>
                        {formatDuration(status.duration)}
                      </span>
                    )}
                    {hasData && (
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    )}
                  </div>
                </div>

                {/* 展开的数据详情 */}
                {isExpanded && (
                  <div style={{ marginTop: 10 }}>
                    {Boolean(status?.input) && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#6b7280',
                          marginBottom: 4,
                        }}>
                          输入数据:
                        </div>
                        <pre style={{
                          margin: 0,
                          padding: '8px',
                          backgroundColor: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          borderRadius: 4,
                          fontSize: 10,
                          color: '#166534',
                          overflow: 'auto',
                          maxHeight: 100,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all',
                        }}>
                          {JSON.stringify(status.input, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    {Boolean(status?.output) && (
                      <div>
                        <div style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#6b7280',
                          marginBottom: 4,
                        }}>
                          输出数据:
                        </div>
                        <pre style={{
                          margin: 0,
                          padding: '8px',
                          backgroundColor: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          borderRadius: 4,
                          fontSize: 10,
                          color: '#1e40af',
                          overflow: 'auto',
                          maxHeight: 100,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all',
                        }}>
                          {JSON.stringify(status.output, null, 2)}
                        </pre>
                      </div>
                    )}

                    {status?.error && (
                      <div style={{
                        marginTop: 8,
                        padding: '8px',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: 4,
                        fontSize: 11,
                        color: '#991b1b',
                      }}>
                        <strong>错误:</strong> {status.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}