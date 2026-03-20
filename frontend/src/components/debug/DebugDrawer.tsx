import { useRef, useCallback } from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import { useExecutionStore } from '../../store/executionStore';
import { useUIStore } from '../../store/uiStore';
import { executionApi } from '../../api/executionApi';
import { useSSE } from '../../hooks/useSSE';
import InputSection from './InputSection';
import ExecutionTimeline from './ExecutionTimeline';
import AudioPlayer from './AudioPlayer';

export default function DebugDrawer() {
  const isOpen = useUIStore((s) => s.isDebugDrawerOpen);
  const closeDrawer = useUIStore((s) => s.closeDebugDrawer);
  const workflowId = useWorkflowStore((s) => s.workflowId);
  const nodes = useWorkflowStore((s) => s.nodes);
  const { isRunning, nodeStatuses, audioUrl, error, startExecution, reset } = useExecutionStore();
  const { connect } = useSSE();
  const esRef = useRef<EventSource | null>(null);

  const nodeOrder = nodes.map((n) => ({ id: n.id, label: n.data.label }));

  const handleRun = useCallback(
    async (inputText: string) => {
      if (!workflowId) {
        alert('请先保存工作流');
        return;
      }
      reset();
      try {
        const result = await executionApi.start(workflowId, inputText);
        startExecution(result.executionId);
        esRef.current?.close();
        esRef.current = connect(result.executionId);
      } catch (err) {
        console.error('Failed to start execution:', err);
        alert('启动执行失败，请检查后端服务');
      }
    },
    [workflowId, connect, reset, startExecution]
  );

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: isOpen ? 420 : 0,
        height: '100vh',
        background: '#fff',
        borderLeft: isOpen ? '1px solid #e5e7eb' : 'none',
        boxShadow: isOpen ? '-4px 0 16px rgba(0,0,0,0.08)' : 'none',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 15, color: '#1f2937' }}>
          &#128736; 调试面板
        </span>
        <button
          onClick={closeDrawer}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: 18,
            color: '#9ca3af',
            padding: 4,
          }}
        >
          &#10005;
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <InputSection onRun={handleRun} isRunning={isRunning} />

        <ExecutionTimeline nodeStatuses={nodeStatuses} nodeOrder={nodeOrder} />

        {error && (
          <div
            style={{
              padding: 12,
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              fontSize: 12,
              color: '#991b1b',
            }}
          >
            {error}
          </div>
        )}

        {audioUrl && <AudioPlayer audioUrl={audioUrl} />}
      </div>
    </div>
  );
}
