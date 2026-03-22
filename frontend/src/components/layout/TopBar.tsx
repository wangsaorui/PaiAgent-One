import { useCallback, useState } from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import { useUIStore } from '../../store/uiStore';
import { workflowApi } from '../../api/workflowApi';
import SaveWorkflowModal from '../modals/SaveWorkflowModal';
import LoadWorkflowModal from '../modals/LoadWorkflowModal';
import type { WorkflowDefinition } from '../../types/workflow';

export default function TopBar() {
  const { workflowId, workflowName, nodes, edges, setWorkflowId, setWorkflowName, loadWorkflow } =
    useWorkflowStore();
  const toggleDebugDrawer = useUIStore((s) => s.toggleDebugDrawer);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);

  const handleSaveClick = () => {
    setIsSaveModalOpen(true);
  };

  const handleLoadClick = () => {
    setIsLoadModalOpen(true);
  };

  const handleSaveWorkflow = useCallback(async (name: string, saveAsNew: boolean) => {
    const definition: WorkflowDefinition = {
      id: workflowId || '',
      name: name,
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type || n.data?.nodeType || '',
        position: n.position,
        data: n.data,
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
      // 如果选择另存为新工作流，或者当前没有workflowId，则创建新的
      if (saveAsNew || !workflowId) {
        const result = await workflowApi.create({ name, definition });
        setWorkflowId(result.id);
        setWorkflowName(name);
        // 更新URL，添加工作流ID
        window.history.pushState(null, '', `?workflowId=${result.id}`);
        alert(`工作流 "${name}" 创建成功！`);
      } else {
        // 否则更新现有工作流
        await workflowApi.update(workflowId, { name, definition });
        setWorkflowName(name);
        alert('工作流保存成功！');
      }
      return Promise.resolve();
    } catch (err) {
      console.error('Save failed:', err);
      alert('保存失败，请检查网络连接');
      throw err;
    }
  }, [workflowId, nodes, edges, setWorkflowId, setWorkflowName]);

  const handleLoadWorkflow = useCallback(async (loadedWorkflowId: string) => {
    try {
      // 从API获取工作流数据
      const workflow = await workflowApi.get(loadedWorkflowId);
      
      // 使用store的loadWorkflow方法加载工作流
      const def = workflow.definition;
      if (def && def.nodes) {
        loadWorkflow(workflow.id, workflow.name, def.nodes, def.edges || []);
        
        // 更新URL（不刷新页面）
        window.history.pushState(null, '', `?workflowId=${loadedWorkflowId}`);
        
        // 关闭对话框
        setIsLoadModalOpen(false);
      }
    } catch (err) {
      console.error('Load workflow failed:', err);
      alert('加载工作流失败，请检查网络连接');
    }
  }, [loadWorkflow]);

  return (
    <>
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
          placeholder="输入工作流名称"
          style={{
            border: '1px solid transparent',
            borderRadius: 6,
            padding: '6px 10px',
            fontSize: 14,
            fontWeight: 500,
            color: '#1f2937',
            outline: 'none',
            background: 'transparent',
            transition: 'border-color 0.2s',
            minWidth: 200,
          }}
          onFocus={(e) => (e.target.style.borderColor = '#d1d5db')}
          onBlur={(e) => (e.target.style.borderColor = 'transparent')}
        />
        <div style={{ flex: 1 }} />
        <button 
          onClick={handleLoadClick} 
          style={btnStyle('#6b7280')}
        >
          📂 加载
        </button>
        <button 
          onClick={handleSaveClick} 
          style={btnStyle('#6366f1')}
        >
          💾 保存
        </button>
        <button onClick={toggleDebugDrawer} style={btnStyle('#059669')}>
          🔧 调试
        </button>
      </div>

      <SaveWorkflowModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveWorkflow}
        currentName={workflowName}
        workflowId={workflowId}
      />

      <LoadWorkflowModal
        isOpen={isLoadModalOpen}
        onClose={() => setIsLoadModalOpen(false)}
        onLoad={handleLoadWorkflow}
      />
    </>
  );
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    padding: '8px 16px',
    borderRadius: 6,
    border: 'none',
    background: bg,
    color: '#fff',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  };
}
