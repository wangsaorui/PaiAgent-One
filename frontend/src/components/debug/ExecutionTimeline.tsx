import type { NodeStatus } from '../../types/execution';

interface ExecutionTimelineProps {
  nodeStatuses: Record<string, NodeStatus>;
  nodeOrder: { id: string; label: string }[];
}

export default function ExecutionTimeline({ nodeStatuses, nodeOrder }: ExecutionTimelineProps) {
  if (nodeOrder.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
        执行进度
      </div>
      {nodeOrder.map((node, idx) => {
        const status = nodeStatuses[node.id];
        const isLast = idx === nodeOrder.length - 1;

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
            <div style={{ paddingBottom: isLast ? 0 : 12, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#1f2937' }}>{node.label}</div>
              {status?.status === 'running' && (
                <div style={{ fontSize: 11, color: '#3b82f6', marginTop: 2 }}>执行中...</div>
              )}
              {status?.status === 'completed' && status.output && (
                <div
                  style={{
                    fontSize: 11,
                    color: '#6b7280',
                    marginTop: 4,
                    background: '#f3f4f6',
                    padding: '6px 8px',
                    borderRadius: 6,
                    maxHeight: 80,
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}
                >
                  {typeof status.output === 'string'
                    ? status.output.slice(0, 300)
                    : JSON.stringify(status.output).slice(0, 300)}
                </div>
              )}
              {status?.status === 'failed' && (
                <div style={{ fontSize: 11, color: '#ef4444', marginTop: 2 }}>
                  {status.error || '执行失败'}
                </div>
              )}
            </div>
          </div>
        );
      })}
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
