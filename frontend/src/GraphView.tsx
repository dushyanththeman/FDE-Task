import { useRef, useCallback } from 'react'
import ForceGraph2D from 'react-force-graph-2d'

interface Props {
  data: { nodes: any[]; links: any[] }
  highlightNodes: string[]
  onNodeClick: (node: any) => void
  showLabels: boolean
}

export default function GraphView({ data, highlightNodes, onNodeClick, showLabels }: Props) {
  const fgRef = useRef<any>()

  const nodeCanvasObject = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const isHighlighted = highlightNodes.includes(node.id)
      const radius = isHighlighted ? 9 : 5

      // Draw circle
      ctx.beginPath()
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI)
      ctx.fillStyle = isHighlighted ? '#FF3B30' : node.color || '#888'
      ctx.fill()

      // Draw label if showLabels
      if (showLabels) {
        const label = node.type || node.id
        const fontSize = Math.max(8 / globalScale, 2)
        ctx.font = `${fontSize}px Sans-Serif`
        ctx.fillStyle = '#888888'
        ctx.textAlign = 'center'
        ctx.fillText(label, node.x, node.y + radius + fontSize + 1)
      }
    },
    [highlightNodes, showLabels]
  )

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        nodeCanvasObject={nodeCanvasObject}
        nodeCanvasObjectMode={() => 'replace'}
        linkColor={() => '#B5D4F4'}
        linkWidth={0.5}
        backgroundColor="#f8f8f8"
        onNodeClick={onNodeClick}
        nodeLabel={(node: any) => `${node.type}: ${node.id}`}
        width={undefined}
        height={undefined}
      />
    </div>
  )
}
