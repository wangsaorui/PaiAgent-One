interface NodePaletteItemProps {
  nodeType: string;
  label: string;
  icon: string;
  color: string;
}

export default function NodePaletteItem({ nodeType, label, icon, color }: NodePaletteItemProps) {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow-type', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        borderRadius: 8,
        border: `1px solid ${color}33`,
        background: `${color}0a`,
        cursor: 'grab',
        transition: 'background 0.2s, transform 0.1s',
        fontSize: 13,
        fontWeight: 500,
        color: '#374151',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = `${color}1a`)}
      onMouseLeave={(e) => (e.currentTarget.style.background = `${color}0a`)}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span>{label}</span>
    </div>
  );
}
