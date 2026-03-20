export default function AudioPlayer({ audioUrl }: { audioUrl: string }) {
  return (
    <div
      style={{
        padding: 16,
        background: '#f0fdf4',
        borderRadius: 10,
        border: '1px solid #bbf7d0',
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#166534',
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span>&#127911;</span> AI 播客生成完毕
      </div>
      <audio controls src={audioUrl} style={{ width: '100%' }} />
    </div>
  );
}
