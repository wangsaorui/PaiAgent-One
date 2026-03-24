import { useRef, useCallback, useState, useEffect } from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import { useExecutionStore } from '../../store/executionStore';
import { useUIStore } from '../../store/uiStore';
import { executionApi } from '../../api/executionApi';
import { useSSE } from '../../hooks/useSSE';
import InputSection from './InputSection';
import ExecutionTimeline from './ExecutionTimeline';
import ExecutionLogPanel from './ExecutionLogPanel';
import DataFlowPanel from './DataFlowPanel';
import AudioPlayer from './AudioPlayer';

type TabType = 'status' | 'logs' | 'dataflow';

export default function DebugDrawer() {
  const isOpen = useUIStore((s) => s.isDebugDrawerOpen);
  const closeDrawer = useUIStore((s) => s.closeDebugDrawer);
  const workflowId = useWorkflowStore((s) => s.workflowId);
  const nodes = useWorkflowStore((s) => s.nodes);
  const { 
    isRunning, 
    nodeStatuses, 
    audioUrl, 
    error, 
    logs, 
    startExecution, 
    reset,
    addLog
  } = useExecutionStore();
  const { connect } = useSSE();
  const esRef = useRef<EventSource | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('status');
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);

  const nodeOrder = nodes.map((n) => ({ id: n.id, label: n.data.label }));

  // 检查后端可用性
  useEffect(() => {
    if (isOpen) {
      const checkBackend = async () => {
        try {
          const response = await fetch('/api/workflows');
          setBackendAvailable(response.ok);
        } catch {
          setBackendAvailable(false);
        }
      };
      checkBackend();
    }
  }, [isOpen]);

  const handleRun = useCallback(
    async (inputText: string) => {
      if (!workflowId) {
        alert('请先保存工作流');
        return;
      }
      
      // 检查后端是否可用
      if (backendAvailable === false) {
        alert('后端服务未运行，请先启动后端服务');
        addLog({
          type: 'error',
          message: '后端服务未响应，无法开始执行',
        });
        return;
      }

      reset();
      try {
        addLog({
          type: 'info',
          message: '正在启动工作流执行...',
        });
        
        const result = await executionApi.start(workflowId, inputText);
        startExecution(result.executionId);
        addLog({
          type: 'info',
          message: `执行已启动，ID: ${result.executionId}`,
        });
        
        esRef.current?.close();
        esRef.current = connect(result.executionId);
      } catch (err) {
        console.error('Failed to start execution:', err);
        const errorMessage = err instanceof Error ? err.message : '未知错误';
        addLog({
          type: 'error',
          message: `启动执行失败: ${errorMessage}`,
        });
        alert(`启动执行失败，请检查后端服务\n错误信息: ${errorMessage}`);
      }
    },
    [workflowId, connect, reset, startExecution, backendAvailable, addLog]
  );

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'status', label: '执行状态', icon: '📊' },
    { id: 'logs', label: '执行日志', icon: '📝' },
    { id: 'dataflow', label: '数据流转', icon: '🔄' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: isOpen ? 480 : 0,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: '#1f2937' }}>
            🔧 调试面板
          </span>
          {backendAvailable === false && (
            <span style={{
              fontSize: 11,
              backgroundColor: '#fef2f2',
              color: '#ef4444',
              padding: '2px 6px',
              borderRadius: 4,
              border: '1px solid #fecaca',
            }}>
              后端未连接
            </span>
          )}
          {backendAvailable === true && (
            <span style={{
              fontSize: 11,
              backgroundColor: '#f0fdf4',
              color: '#22c55e',
              padding: '2px 6px',
              borderRadius: 4,
              border: '1px solid #bbf7d0',
            }}>
              已连接
            </span>
          )}
        </div>
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
          ✕
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 输入区域 */}
        <div style={{ padding: '16px 20px 0' }}>
          <InputSection onRun={handleRun} isRunning={isRunning} />
          
          {/* 后端状态提示 */}
          {backendAvailable === false && (
            <div style={{
              marginTop: 12,
              padding: 12,
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 6,
              fontSize: 12,
              color: '#92400e',
            }}>
              ⚠️ 后端服务未运行，请确保后端服务已在端口8080启动
            </div>
          )}
        </div>

        {/* 选项卡 */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
          padding: '0 20px',
          marginTop: 16,
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 16px',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
                fontWeight: activeTab === tab.id ? 600 : 400,
                cursor: 'pointer',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: '-1px',
                transition: 'all 0.2s',
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tab.id === 'logs' && logs.length > 0 && (
                <span style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: 10,
                  padding: '1px 6px',
                  fontSize: 10,
                  minWidth: 18,
                  textAlign: 'center',
                }}>
                  {logs.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: 20,
          }}
        >
          {activeTab === 'status' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
                  ❌ {error}
                </div>
              )}

              {audioUrl && (
                <div>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: 8,
                  }}>
                    最终输出
                  </div>
                  <AudioPlayer audioUrl={audioUrl} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'logs' && (
            <div style={{ height: '100%' }}>
              <ExecutionLogPanel logs={logs} />
            </div>
          )}

          {activeTab === 'dataflow' && (
            <DataFlowPanel nodeStatuses={nodeStatuses} nodeOrder={nodeOrder} />
          )}
        </div>
      </div>
    </div>
  );
}
