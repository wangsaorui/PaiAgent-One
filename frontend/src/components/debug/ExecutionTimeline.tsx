import { useState } from 'react';
import type { NodeStatus } from '../../types/execution';

interface ExecutionTimelineProps {
  nodeStatuses: Record<string, NodeStatus>;
  nodeOrder: { id: string; label: string }[];
}

export default function ExecutionTimeline({ nodeStatuses, nodeOrder }: ExecutionTimelineProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  if (nodeOrder.length === 0) return null;

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'pending': return '等待中';
      case 'running': return '执行中';
      case 'completed': return '已完成';
      case 'failed': return '失败';
      default: return '未执行';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
        执行状态
      </div>
      {nodeOrder.map((node, idx) => {
        const status = nodeStatuses[node.id];
        const isLast = idx === nodeOrder.length - 1;
        const isExpanded = expandedNodes.has(node.id);
        const hasOutput = status?.output !== undefined;

        return (
          <div key={node.id} style={{ display: 'flex', gap: 12 }}>
            {/* Timeline bar */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: 20,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: getStatusColor(status?.status),
                  border: `2px solid ${getStatusBorder(status?.status)}`,
                  flexShrink: 0,
                  animation: status?.status === 'running' ? 'pulse 2s infinite' : 'none',
                }}
              />
              {!isLast && (
                <div
                  style={{
                    width: 2,
                    flex: 1,
                    minHeight: 24,
                    background: status?.status === 'completed' ? '#22c55e' : '#e5e7eb',
                  }}
                />
              )}
            </div>
            
            {/* Content */}
            <div style={{ paddingBottom: isLast ? 0 : 12, flex: 1, minWidth: 0 }}>
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1f2937' }}>
                  {node.label}
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
                  <span style={{
                    fontSize: 10,
                    color: getStatusColor(status?.status),
                    fontWeight: 500,
                  }}>
                    {getStatusText(status?.status)}
                  </span>
                </div>
              </div>
              
              {status?.status === 'running' && (
                <div style={{ fontSize: 11, color: '#3b82f6', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                  {status.error || '执行中...'}
                </div>
              )}
              
              {status?.status === 'failed' && status.error && (
                <div style={{ 
                  fontSize: 11, 
                  color: '#ef4444', 
                  marginTop: 4,
                  padding: '6px 8px',
                  backgroundColor: '#fef2f2',
                  borderRadius: 4,
                  border: '1px solid #fecaca',
                }}>
                  ❌ {status.error}
                </div>
              )}

              {status?.status === 'completed' && hasOutput && (
                <div style={{ marginTop: 6 }}>
                  <div 
                    onClick={() => toggleNode(node.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      cursor: 'pointer',
                      fontSize: 11,
                      color: '#6b7280',
                      marginBottom: 4,
                    }}
                  >
                    <span>{isExpanded ? '▼' : '▶'}</span>
                    <span>查看输出数据</span>
                  </div>
                  
                  {isExpanded && (
                    <pre
                      style={{
                        fontSize: 10,
                        color: '#374151',
                        background: '#f9fafb',
                        padding: '8px',
                        borderRadius: 6,
                        maxHeight: 150,
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                        margin: 0,
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      {JSON.stringify(status.output, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function getStatusColor(status?: string) {
  switch (status) {
    case 'running':
      return '#3b82f6';
    case 'completed':
      return '#22c55e';
    case 'failed':
      return '#ef4444';
    default:
      return '#e5e7eb';
  }
}

function getStatusBorder(status?: string) {
  switch (status) {
    case 'running':
      return '#2563eb';
    case 'completed':
      return '#16a34a';
    case 'failed':
      return '#dc2626';
    default:
      return '#d1d5db';
  }
}
