import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, Users, Share2, Globe } from 'lucide-react';

function TypeIcon({ type }: { type: string }) {
  const className = "h-4 w-4";
  switch (type) {
    case "press":
      return <Newspaper className={className} />;
    case "community":
      return <Users className={className} />;
    case "aggregator":
      return <Share2 className={className} />;
    case "blog":
      return <Globe className={className} />;
    case "corpPR":
      return <Globe className={className} />;
    default:
      return <Globe className={className} />;
  }
}

// Enhanced OriginMap with hover states, selection, and pulse animations
function EnhancedOriginMap({ data, onSelect, selectedId }: { 
  data: any, 
  onSelect: (id: string) => void,
  selectedId?: string 
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    showPress: true,
    showCommunity: true,
    showAggregator: true,
    timeRange: [0, 24] // hours
  });

  const width = 620, height = 420;
  const cx = width/2, cy = height/2;
  const ring1R = 120, ring2R = 190;

  // Enhanced node with hover and selection states
  const EnhancedNode = ({ n, x, y, isCenter = false }: any) => {
    const isSelected = selectedId === n.id;
    const isHovered = hoveredId === n.id;
    const nodeRadius = isCenter ? 25 : 20;
    const scoreRadius = Math.max(15, nodeRadius * Math.sqrt(n.score || 0.5));

    return (
      <motion.g 
        transform={`translate(${x},${y})`} 
        className="cursor-pointer"
        onClick={() => onSelect(n.id)}
        onMouseEnter={() => setHoveredId(n.id)}
        onMouseLeave={() => setHoveredId(null)}
        whileHover={{ scale: 1.1 }}
        animate={{ 
          scale: isSelected ? 1.15 : 1,
          opacity: hoveredId && !isHovered ? 0.6 : 1
        }}
      >
        {/* Pulse animation for new nodes */}
        {n.isNew && (
          <motion.circle
            r={scoreRadius + 10}
            className="fill-blue-200 stroke-blue-400"
            initial={{ r: scoreRadius, opacity: 1 }}
            animate={{ r: scoreRadius + 20, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        
        {/* Main node circle */}
        <circle 
          r={scoreRadius} 
          className={`fill-white stroke-2 transition-all ${
            n.confidence === 'High' ? 'stroke-emerald-500' : 
            n.confidence === 'Mid' ? 'stroke-amber-500' : 'stroke-zinc-400'
          } ${isSelected ? 'stroke-4 drop-shadow-lg' : ''}`}
        />
        
        {/* Selection ring */}
        {isSelected && (
          <circle 
            r={scoreRadius + 5} 
            className="fill-none stroke-blue-500 stroke-2 stroke-dasharray-[4,4]"
          />
        )}

        {/* Node content */}
        <foreignObject x={-60} y={nodeRadius + 8} width={120} height={50}>
          <div className={`text-[10px] text-center transition-all ${
            isHovered ? 'text-zinc-900 font-medium' : 'text-zinc-700'
          }`}>
            <div className="truncate">{n.title}</div>
            <div className="text-zinc-500 text-[9px]">
              Score: {Math.round((n.score || 0) * 100)}
            </div>
          </div>
        </foreignObject>

        {/* Type icon */}
        <foreignObject x={-8} y={-8} width={16} height={16}>
          <div className="flex items-center justify-center">
            <TypeIcon type={n.type} />
          </div>
        </foreignObject>
      </motion.g>
    );
  };

  // Enhanced edge with hover effects
  const EnhancedEdge = ({ edge, srcCoord, dstCoord, index }: any) => {
    const isHighlighted = hoveredId === edge.src || hoveredId === edge.dst;
    
    return (
      <motion.g key={index}>
        <line 
          x1={srcCoord.x} y1={srcCoord.y} 
          x2={dstCoord.x} y2={dstCoord.y} 
          className={`transition-all ${
            isHighlighted ? 'stroke-blue-500 stroke-2' : 'stroke-zinc-300'
          }`}
          strokeWidth={edge.weight > 0.9 ? 2 : 1}
        />
        
        {/* Citation tooltip on hover */}
        {isHighlighted && (
          <foreignObject 
            x={(srcCoord.x + dstCoord.x) / 2 - 40} 
            y={(srcCoord.y + dstCoord.y) / 2 - 10} 
            width={80} height={20}
          >
            <div className="bg-black text-white text-[9px] px-2 py-1 rounded text-center">
              {edge.reason}
            </div>
          </foreignObject>
        )}
      </motion.g>
    );
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border bg-white">
      {/* Filter controls */}
      <div className="px-4 py-2 border-b bg-zinc-50 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            checked={filters.showPress}
            onChange={(e) => setFilters(f => ({...f, showPress: e.target.checked}))}
            className="rounded"
          />
          <span>언론</span>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            checked={filters.showCommunity}
            onChange={(e) => setFilters(f => ({...f, showCommunity: e.target.checked}))}
            className="rounded"
          />
          <span>커뮤니티</span>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            checked={filters.showAggregator}
            onChange={(e) => setFilters(f => ({...f, showAggregator: e.target.checked}))}
            className="rounded"
          />
          <span>집계</span>
        </div>
      </div>

      <svg width={width} height={height}>
        {/* Background rings */}
        <circle cx={cx} cy={cy} r={ring1R} className="fill-none stroke-zinc-100 stroke-dasharray-[2,2]"/>
        <circle cx={cx} cy={cy} r={ring2R} className="fill-none stroke-zinc-100 stroke-dasharray-[2,2]"/>
        
        {/* Center label */}
        <text x={cx} y={cy - 60} textAnchor="middle" className="text-xs fill-zinc-500">
          발원 후보
        </text>

        {/* Render edges first (behind nodes) */}
        {data.edges.map((edge: any, i: number) => {
          const srcCoord = getCoordinate(edge.src, data);
          const dstCoord = getCoordinate(edge.dst, data);
          if (!srcCoord || !dstCoord) return null;
          
          return (
            <EnhancedEdge 
              key={i}
              edge={edge}
              srcCoord={srcCoord}
              dstCoord={dstCoord}
              index={i}
            />
          );
        })}

        {/* Render nodes */}
        <EnhancedNode n={data.center[0]} x={cx-40} y={cy} isCenter />
        {data.center[1] && <EnhancedNode n={data.center[1]} x={cx+40} y={cy} isCenter />}
        
        {data.ring1.map((n: any, i: number) => {
          const pos = ringPosition(ring1R, data.ring1.length, i);
          return <EnhancedNode key={n.id} n={n} x={cx + pos.x} y={cy + pos.y} />;
        })}
        
        {data.ring2.map((n: any, i: number) => {
          const pos = ringPosition(ring2R, data.ring2.length, i);
          return <EnhancedNode key={n.id} n={n} x={cx + pos.x} y={cy + pos.y} />;
        })}
      </svg>

      {/* Enhanced legend */}
      <div className="px-4 py-3 bg-zinc-50 text-[11px] text-zinc-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>High
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>Mid
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-zinc-400"></span>Low
            </div>
          </div>
          <div className="text-zinc-500">
            노드 크기 = TraceScore · 클릭하여 근거 확인
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function ringPosition(radius: number, total: number, index: number) {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle)
  };
}

function getCoordinate(nodeId: string, data: any) {
  const cx = 310, cy = 210; // center of SVG
  
  // Check center nodes
  if (nodeId === data.center[0]?.id) return { x: cx - 40, y: cy };
  if (nodeId === data.center[1]?.id) return { x: cx + 40, y: cy };
  
  // Check ring1
  const ring1Index = data.ring1.findIndex((n: any) => n.id === nodeId);
  if (ring1Index !== -1) {
    const pos = ringPosition(120, data.ring1.length, ring1Index);
    return { x: cx + pos.x, y: cy + pos.y };
  }
  
  // Check ring2
  const ring2Index = data.ring2.findIndex((n: any) => n.id === nodeId);
  if (ring2Index !== -1) {
    const pos = ringPosition(190, data.ring2.length, ring2Index);
    return { x: cx + pos.x, y: cy + pos.y };
  }
  
  return null;
}

export default EnhancedOriginMap;
