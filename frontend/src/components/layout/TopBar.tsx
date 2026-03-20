import { useCallback } from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import { useUIStore } from '../../store/uiStore';
import { workflowApi } from '../../api/workflowApi';

export default function TopBar() {
  const { workflowId, workflowName, nodes, edges, setWorkflowId, setWorkflowName } =
    useWorkflowStore();
  const toggleDebugDrawer = useUIStore((s) => s.toggleDebugDrawer);

  const handleSave = useCallback(async () => {
    const definition = {
      id: workflowId || '',
      name: workflowName,
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type!,
        position: n.position,
        config: n.data.config,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        sourceHandle: e.sourceHandle || undefined,
        target: e.target,
        targetHandle: e.targetHandle || undefined,
      })),
    };

    try {
      if (workflowId) {
        await workflowApi.update(workflowId, { name: workflowName, definition: definition as never });
      } else {
        const result = await workflowApi.create({ name: workflowName, definition: definition as never });
        setWorkflowId(result.id);
      }
    } catch (err) {
      console.error('Save failed:', err);
      alert('保存失败');
    }
  }, [workflowId, workflowName, nodes, edges, setWorkflowId]);

  return (
    <div
      style={{
        height: 52,
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 16,
        background: '#fff',
        flexShrink: 0,
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 700, color: '#4f46e5' }}>PaiAgent</div>
      <div style={{ width: 1, height: 24, background: '#e5e7eb' }} />
      <input
        value={workflowName}
        onChange={(e) => setWorkflowName(e.target.value)}
        style={{
          border: '1px solid transparent',
          borderRadius: 6,
          padding: '4px 8px',
          fontSize: 14,
          fontWeight: 500,
          color: '#1f2937',
          outline: 'none',
          background: 'transparent',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => (e.target.style.borderColor = '#d1d5db')}
        onBlur={(e) => (e.target.style.borderColor = 'transparent')}
      />
      <div style={{ flex: 1 }} />
      <button onClick={handleSave} style={btnStyle('#6366f1')}>
        保存
      </button>
      <button onClick={toggleDebugDrawer} style={btnStyle('#059669')}>
        &#128736; 调试
      </button>
    </div>
  );
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    padding: '6px 16px',
    borderRadius: 6,
    border: 'none',
    background: bg,
    color: '#fff',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
  };
}
