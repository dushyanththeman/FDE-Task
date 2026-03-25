import { useState, useEffect, useCallback } from 'react'
import GraphView from './GraphView'
import ChatPanel from './ChatPanel'
import NodePanel from './NodePanel'
import { fetchGraph } from './api'

export default function App() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })
  const [highlightNodes, setHighlightNodes] = useState<string[]>([])
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showLabels, setShowLabels] = useState(true)

  useEffect(() => {
    fetchGraph().then(data => {
      const links = (data.edges || []).map((e: any) => ({
        source: e.source,
        target: e.target,
        relation: e.relation
      }))
      setGraphData({ nodes: data.nodes || [], links })
    })
  }, [])

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node)
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
      }}
    >
      {/* HEADER */}
      <div
        style={{
          height: 48,
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          flexShrink: 0,
          gap: 6
        }}
      >
        <span style={{ color: '#9ca3af', fontSize: 14 }}>Mapping /</span>
        <span style={{ color: '#111', fontSize: 14, fontWeight: 600 }}>Order to Cash</span>
      </div>

      {/* BODY */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* LEFT — GRAPH PANEL */}
        <div
          style={{
            width: isMinimized ? 0 : '65%',
            minWidth: isMinimized ? 0 : undefined,
            position: 'relative',
            overflow: 'hidden',
            transition: 'width 0.3s ease',
            borderRight: '1px solid #e5e7eb'
          }}
        >
          {!isMinimized && (
            <>
              <GraphView
                data={graphData}
                highlightNodes={highlightNodes}
                onNodeClick={handleNodeClick}
                showLabels={showLabels}
              />

              {/* CONTROL BUTTONS */}
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  display: 'flex',
                  gap: 8,
                  zIndex: 10
                }}
              >
                <button
                  onClick={() => setIsMinimized(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    fontWeight: 500
                  }}
                >
                  <span>⤢</span> Minimize
                </button>
                <button
                  onClick={() => setShowLabels(v => !v)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: showLabels ? '#111' : '#fff',
                    color: showLabels ? '#fff' : '#111',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    fontWeight: 500
                  }}
                >
                  <span>⊞</span> {showLabels ? 'Hide' : 'Show'} Granular Overlay
                </button>
              </div>

              {selectedNode && <NodePanel node={selectedNode} onClose={() => setSelectedNode(null)} />}
            </>
          )}

          {isMinimized && (
            <button
              onClick={() => setIsMinimized(false)}
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 12,
                cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
              }}
            >
              ⤢ Expand
            </button>
          )}
        </div>

        {/* RIGHT — CHAT PANEL */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <ChatPanel onHighlight={setHighlightNodes} />
        </div>
      </div>
    </div>
  )
}
