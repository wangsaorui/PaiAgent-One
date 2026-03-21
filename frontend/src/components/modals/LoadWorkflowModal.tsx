import { useState, useEffect } from 'react';
import { workflowApi } from '../../api/workflowApi';
import type { WorkflowDTO } from '../../types/workflow';

interface LoadWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (workflowId: string) => void;
}

export default function LoadWorkflowModal({ isOpen, onClose, onLoad }: LoadWorkflowModalProps) {
  const [workflows, setWorkflows] = useState<WorkflowDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadWorkflows();
    }
  }, [isOpen]);

  const loadWorkflows = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await workflowApi.list();
      // 按创建时间倒序排列
      const sorted = data.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      setWorkflows(sorted);
    } catch (err) {
      console.error('Failed to load workflows:', err);
      setError('加载工作流列表失败，请检查后端服务');
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = (workflowId: string) => {
    onLoad(workflowId);
    onClose();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '未知时间';
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 0,
        width: 600,
        maxWidth: '90vw',
        maxHeight: '80vh',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h3 style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 600,
            color: '#1f2937',
          }}>
            加载工作流
          </h3>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: 20,
              color: '#9ca3af',
              padding: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px 24px',
        }}>
          {loading && (
            <div style={{
              textAlign: 'center',
              padding: '40px 0',
              color: '#6b7280',
            }}>
              加载中...
            </div>
          )}

          {error && (
            <div style={{
              padding: 16,
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              color: '#991b1b',
              fontSize: 14,
            }}>
              ❌ {error}
            </div>
          )}

          {!loading && !error && workflows.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px 0',
              color: '#9ca3af',
            }}>
              暂无已保存的工作流
            </div>
          )}

          {!loading && !error && workflows.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  style={{
                    padding: '16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.backgroundColor = '#f0f9ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: '#1f2937',
                      marginBottom: 4,
                    }}>
                      {workflow.name}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: '#6b7280',
                    }}>
                      创建时间: {formatDate(workflow.createdAt)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleLoad(workflow.id)}
                    style={{
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 500,
                      border: 'none',
                      borderRadius: 6,
                      background: '#3b82f6',
                      color: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    加载
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              border: '1px solid #d1d5db',
              borderRadius: 6,
              background: 'white',
              color: '#374151',
              cursor: 'pointer',
            }}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}