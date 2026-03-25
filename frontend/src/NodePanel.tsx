interface Props {
  node: any
  onClose: () => void
}

const SKIP_FIELDS = new Set([
  'x',
  'y',
  'vx',
  'vy',
  'index',
  'color',
  'type',
  '__indexColor',
  'fx',
  'fy'
])

export default function NodePanel({ node, onClose }: Props) {
  const entries = Object.entries(node).filter(([k]) => !SKIP_FIELDS.has(k))
  const visible = entries.slice(0, 8)
  const hasMore = entries.length > 8

  return (
    <div
      style={{
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 1000,
        width: 300,
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        padding: 20,
        border: '1px solid #f0f0f0'
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#9ca3af',
          fontSize: 14,
          lineHeight: 1,
          padding: 4
        }}
      >
        ✕
      </button>

      {/* Header */}
      <div style={{ fontWeight: 700, fontSize: 16, color: '#111', marginBottom: 2 }}>{node.type}</div>
      <div style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic', marginBottom: 12 }}>
        Entity: {node.type}
      </div>
      <hr
        style={{
          border: 'none',
          borderTop: '1px solid #e5e7eb',
          margin: '0 0 12px 0'
        }}
      />

      {/* Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {visible.map(([k, v]) => (
          <div key={k} style={{ fontSize: 12 }}>
            <span style={{ color: '#9ca3af' }}>{k}: </span>
            <span style={{ color: '#111' }}>{String(v ?? '')}</span>
          </div>
        ))}
        {hasMore && (
          <div
            style={{
              fontSize: 12,
              color: '#9ca3af',
              fontStyle: 'italic',
              marginTop: 4
            }}
          >
            Additional fields hidden for readability
          </div>
        )}
      </div>

      <hr
        style={{
          border: 'none',
          borderTop: '1px solid #e5e7eb',
          margin: '12px 0'
        }}
      />
      <div style={{ fontSize: 12, color: '#111' }}>
        <strong>Connections:</strong> {node.__connections || 0}
      </div>
    </div>
  )
}
