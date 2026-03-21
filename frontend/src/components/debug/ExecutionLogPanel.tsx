import { useRef, useEffect } from 'react';
import type { ExecutionLog } from '../../types/execution';

interface ExecutionLogPanelProps {
  logs: ExecutionLog[];
}

export default function ExecutionLogPanel({ logs }: ExecutionLogPanelProps) {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 自动滚动到最新日志
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (logs.length === 0) {
    return (
      <div style={{
        padding: 20,
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: 13,
      }}>
        暂无执行日志
      </div>
    );
  }

  const getLogIcon = (type: ExecutionLog['type']) => {
    switch (type) {
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'data': return '📊';
      default: return '•';
    }
  };

  const getLogColor = (type: ExecutionLog['type']) => {
    switch (type) {
      case 'info': return '#3b82f6';
      case 'success': return '#22c55e';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'data': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    }) + '.' + String(date.getMilliseconds()).padStart(3, '0');
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%',
    }}>
      <div style={{
        fontSize: 13,
        fontWeight: 600,
        color: '#374151',
        marginBottom: 8,
        padding: '0 4px',
      }}>
        执行日志 ({logs.length})
      </div>
      
      <div style={{
        flex: 1,
        overflow: 'auto',
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        border: '1px solid #e5e7eb',
        padding: 8,
      }}>
        {logs.map((log) => (
          <div
            key={log.id}
            style={{
              padding: '8px 10px',
              marginBottom: 4,
              backgroundColor: 'white',
              borderRadius: 6,
              borderLeft: `3px solid ${getLogColor(log.type)}`,
              fontSize: 12,
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: 8,
              marginBottom: log.data ? 4 : 0,
            }}>
              <span style={{ fontSize: 14 }}>{getLogIcon(log.type)}</span>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  color: '#374151', 
                  fontWeight: 500,
                  marginBottom: 2,
                }}>
                  {log.message}
                </div>
                <div style={{ 
                  fontSize: 10, 
                  color: '#9ca3af',
                  display: 'flex',
                  gap: 8,
                }}>
                  <span>{formatTime(log.timestamp)}</span>
                  {log.nodeId && (
                    <span style={{ 
                      backgroundColor: '#f3f4f6', 
                      padding: '1px 4px', 
                      borderRadius: 3,
                    }}>
                      {log.nodeName || log.nodeId}
                    </span>
                  )}
                </div>
                {log.data && (
                  <pre style={{
                    marginTop: 6,
                    padding: '6px 8px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: 4,
                    fontSize: 10,
                    color: '#6b7280',
                    overflow: 'auto',
                    maxHeight: 120,
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}>
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}