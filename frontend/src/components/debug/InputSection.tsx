import { useState } from 'react';

interface InputSectionProps {
  onRun: (text: string) => void;
  isRunning: boolean;
}

export default function InputSection({ onRun, isRunning }: InputSectionProps) {
  const [text, setText] = useState('');

  const handleRun = () => {
    if (text.trim() && !isRunning) {
      onRun(text.trim());
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
        测试输入
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入测试文本，例如：请为我生成一期关于人工智能未来发展的播客..."
        disabled={isRunning}
        rows={4}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #d1d5db',
          borderRadius: 8,
          fontSize: 13,
          resize: 'vertical',
          outline: 'none',
          fontFamily: 'inherit',
          boxSizing: 'border-box',
          backgroundColor: isRunning ? '#f9fafb' : 'white',
        }}
        onFocus={(e) => !isRunning && (e.target.style.borderColor = '#3b82f6')}
        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
      />
      <button
        onClick={handleRun}
        disabled={isRunning || !text.trim()}
        style={{
          padding: '10px 0',
          borderRadius: 8,
          border: 'none',
          background: isRunning ? '#9ca3af' : '#6366f1',
          color: '#fff',
          fontWeight: 600,
          fontSize: 14,
          cursor: (isRunning || !text.trim()) ? 'not-allowed' : 'pointer',
          opacity: (isRunning || !text.trim()) ? 0.7 : 1,
          transition: 'all 0.2s',
        }}
      >
        {isRunning ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
            运行中...
          </span>
        ) : (
          '▶️ 运行'
        )}
      </button>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
