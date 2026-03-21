import { useState, useEffect } from 'react';
import { workflowApi } from '../../api/workflowApi';
import type { WorkflowDTO } from '../../types/workflow';

interface SaveWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, asNew: boolean) => void;
  currentName: string;
  workflowId: string | null;
}

export default function SaveWorkflowModal({ isOpen, onClose, onSave, currentName, workflowId }: SaveWorkflowModalProps) {
  const [workflowName, setWorkflowName] = useState(currentName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveAsNew, setSaveAsNew] = useState(!workflowId);
  const [existingWorkflows, setExistingWorkflows] = useState<WorkflowDTO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setWorkflowName(currentName || '');
    setSaveAsNew(!workflowId);
  }, [currentName, workflowId]);

  useEffect(() => {
    if (isOpen) {
      loadExistingWorkflows();
    }
  }, [isOpen]);

  const loadExistingWorkflows = async () => {
    setLoading(true);
    try {
      const workflows = await workflowApi.list();
      setExistingWorkflows(workflows);
    } catch (err) {
      console.error('Failed to load workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workflowName.trim()) {
      alert('请输入工作流名称');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(workflowName.trim(), saveAsNew);
      setWorkflowName('');
      onClose();
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '未知时间';
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
        width: 500,
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
        }}>
          <h3 style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 600,
            color: '#1f2937',
          }}>
            保存工作流
          </h3>
        </div>
        
        {/* Content */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ padding: '20px 24px' }}>
            {/* 保存选项 */}
            {workflowId && (
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 14,
                  color: '#374151',
                  cursor: 'pointer',
                }}>
                  <input
                    type="checkbox"
                    checked={saveAsNew}
                    onChange={(e) => setSaveAsNew(e.target.checked)}
                    style={{ width: 16, height: 16 }}
                  />
                  <span>另存为新工作流</span>
                </label>
                {!saveAsNew && (
                  <div style={{
                    marginTop: 8,
                    padding: '8px 12px',
                    backgroundColor: '#f0f9ff',
                    borderRadius: 6,
                    fontSize: 12,
                    color: '#0369a1',
                  }}>
                    将更新现有工作流: {currentName}
                  </div>
                )}
              </div>
            )}
            
            {/* 工作流名称 */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block',
                marginBottom: 8,
                fontSize: 14,
                fontWeight: 500,
                color: '#374151',
              }}>
                工作流名称
              </label>
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="输入工作流名称"
                autoFocus
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: 14,
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
            
            {/* 已存在的工作流列表（仅在创建新工作流时显示） */}
            {saveAsNew && existingWorkflows.length > 0 && (
              <div>
                <div style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#6b7280',
                  marginBottom: 8,
                }}>
                  已保存的工作流 ({existingWorkflows.length})
                </div>
                <div style={{
                  maxHeight: 200,
                  overflow: 'auto',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                }}>
                  {loading ? (
                    <div style={{ padding: 12, textAlign: 'center', color: '#9ca3af' }}>
                      加载中...
                    </div>
                  ) : (
                    existingWorkflows.map((wf, index) => (
                      <div
                        key={wf.id}
                        style={{
                          padding: '10px 12px',
                          borderBottom: index < existingWorkflows.length - 1 ? '1px solid #f3f4f6' : 'none',
                          fontSize: 13,
                          color: '#374151',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span>{wf.name}</span>
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>
                          {formatDate(wf.createdAt)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            gap: 12,
            justifyContent: 'flex-end',
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              style={{
                padding: '8px 16px',
                fontSize: 13,
                border: '1px solid #d1d5db',
                borderRadius: 6,
                background: 'white',
                color: '#374151',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.7 : 1,
              }}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                padding: '8px 16px',
                fontSize: 13,
                border: 'none',
                borderRadius: 6,
                background: '#3b82f6',
                color: 'white',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.7 : 1,
                fontWeight: 500,
              }}
            >
              {isSaving ? '保存中...' : (saveAsNew ? '创建' : '更新')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}