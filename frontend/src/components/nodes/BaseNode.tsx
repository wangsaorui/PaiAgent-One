import { type ReactNode } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useExecutionStore } from '../../store/executionStore';

interface BaseNodeProps {
  id: string;
  icon: ReactNode;
  label: string;
  color: string;
  hasSource?: boolean;
  hasTarget?: boolean;
  children?: ReactNode;
}

export default function BaseNode({
  id,
  icon,
  label,
  color,
  hasSource = true,
  hasTarget = true,
  children,
}: BaseNodeProps) {
  const nodeStatus = useExecutionStore((s) => s.nodeStatuses[id]);
  const status = nodeStatus?.status;

  const borderColor =
    status === 'running'
      ? '#3b82f6'
      : status === 'completed'
        ? '#22c55e'
        : status === 'failed'
          ? '#ef4444'
          : color;

  const shadowColor =
    status === 'running'
      ? 'rgba(59,130,246,0.4)'
      : status === 'completed'
        ? 'rgba(34,197,94,0.3)'
        : status === 'failed'
          ? 'rgba(239,68,68,0.3)'
          : 'rgba(0,0,0,0.08)';

  return (
    <div
      style={{
        background: '#fff',
        border: `2px solid ${borderColor}`,
        borderRadius: 12,
        padding: '12px 16px',
        minWidth: 200,
        boxShadow: `0 2px 8px ${shadowColor}`,
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
    >
      {hasTarget && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: color, width: 10, height: 10 }}
        />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontWeight: 600, fontSize: 14, color: '#1f2937' }}>{label}</span>
        {status === 'running' && (
          <span
            style={{
              marginLeft: 'auto',
              width: 14,
              height: 14,
              border: '2px solid #3b82f6',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
        )}
        {status === 'completed' && (
          <span style={{ marginLeft: 'auto', color: '#22c55e', fontSize: 16 }}>&#10003;</span>
        )}
        {status === 'failed' && (
          <span style={{ marginLeft: 'auto', color: '#ef4444', fontSize: 16 }}>&#10007;</span>
        )}
      </div>
      {children && <div style={{ marginTop: 8 }}>{children}</div>}
      {hasSource && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: color, width: 10, height: 10 }}
        />
      )}
    </div>
  );
}
