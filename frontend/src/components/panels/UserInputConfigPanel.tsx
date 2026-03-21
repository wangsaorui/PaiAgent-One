export default function UserInputConfigPanel() {
  return (
    <div style={{ 
      padding: 16, 
      borderTop: '1px solid #e5e7eb',
      backgroundColor: 'white',
    }}>
      <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: '#374151' }}>
        节点配置
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={rowStyle}>
          <span style={labelStyle}>变量名</span>
          <span style={valueStyle}>user_input</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>变量类型</span>
          <span style={valueStyle}>String</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>描述</span>
          <span style={valueStyle}>用户本轮的输入内容</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>是否必要</span>
          <span style={{ ...valueStyle, display: 'flex', alignItems: 'center', gap: 4 }}>
            <input type="checkbox" checked readOnly style={{ cursor: 'default' }} />
            <span>必要</span>
          </span>
        </div>
      </div>
    </div>
  );
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#6b7280',
};

const valueStyle: React.CSSProperties = {
  fontSize: 13,
  color: '#374151',
  padding: '8px 10px',
  background: '#f9fafb',
  borderRadius: 6,
  border: '1px solid #e5e7eb',
  width: '100%',
  boxSizing: 'border-box',
};
