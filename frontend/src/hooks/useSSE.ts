import { useCallback } from 'react';
import type { ExecutionEvent } from '../types/execution';
import { useExecutionStore } from '../store/executionStore';

export function useSSE() {
  const { updateNodeStatus, setAudioUrl, setError, setCompleted, addLog } = useExecutionStore();

  const connect = useCallback(
    (executionId: string) => {
      const es = new EventSource(`/api/executions/${executionId}/events`);

      const handleMessage = (e: MessageEvent) => {
        const data: ExecutionEvent = JSON.parse(e.data);

        switch (data.type) {
          case 'NODE_STARTED':
            if (data.nodeId && data.nodeType) {
              updateNodeStatus(data.nodeId, data.nodeType, 'running');
              addLog({
                type: 'info',
                message: `开始执行节点`,
                nodeId: data.nodeId,
                data: { nodeType: data.nodeType },
              });
            }
            break;
          case 'NODE_PROGRESS':
            if (data.nodeId && data.nodeType) {
              // Update progress message in node status
              updateNodeStatus(data.nodeId, data.nodeType, 'running', undefined, undefined, data.message);
              if (data.message) {
                addLog({
                  type: 'info',
                  message: data.message,
                  nodeId: data.nodeId,
                });
              }
            }
            break;
          case 'NODE_COMPLETED':
            if (data.nodeId && data.nodeType) {
              updateNodeStatus(data.nodeId, data.nodeType, 'completed', data.output, data.input);
              addLog({
                type: 'success',
                message: `节点执行完成`,
                nodeId: data.nodeId,
                data: { output: data.output },
              });
            }
            break;
          case 'NODE_FAILED':
            if (data.nodeId && data.nodeType) {
              updateNodeStatus(data.nodeId, data.nodeType, 'failed', undefined, data.input, data.error);
              addLog({
                type: 'error',
                message: `节点执行失败: ${data.error || '未知错误'}`,
                nodeId: data.nodeId,
                data: { error: data.error },
              });
            }
            break;
          case 'EXECUTION_COMPLETED':
            if (data.output && typeof data.output === 'string') {
              setAudioUrl(data.output);
              addLog({
                type: 'success',
                message: '工作流执行完成',
                data: { audioUrl: data.output },
              });
            }
            setCompleted();
            es.close();
            break;
          case 'EXECUTION_FAILED':
            setError(data.error || 'Execution failed');
            addLog({
              type: 'error',
              message: `工作流执行失败: ${data.error || '未知错误'}`,
              data: { error: data.error },
            });
            es.close();
            break;
          default:
            // 处理其他事件类型
            if (data.message) {
              addLog({
                type: 'info',
                message: data.message,
                nodeId: data.nodeId,
                data: data,
              });
            }
        }
      };

      // 添加初始日志
      addLog({
        type: 'info',
        message: '开始执行工作流',
      });

      // 监听所有消息事件，通过 type 字段分发处理
      es.onmessage = handleMessage;

      es.onopen = () => {
        addLog({
          type: 'info',
          message: 'SSE 连接已建立',
        });
      };

      es.onerror = (e) => {
        console.error('SSE error:', e);
        addLog({
          type: 'error',
          message: '与服务器连接中断',
        });
        es.close();
      };

      return es;
    },
    [updateNodeStatus, setAudioUrl, setError, setCompleted, addLog]
  );

  return { connect };
}
