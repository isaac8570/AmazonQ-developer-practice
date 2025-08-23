import React, { useState, useRef, useEffect } from 'react';
import { Newspaper, Users, Share2, Globe, Move } from 'lucide-react';

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

interface NetworkNode {
  id: string;
  title: string;
  domain: string;
  type: string;
  confidence: 'High' | 'Mid' | 'Low';
  score: number;
  timestamp: string;
  isOrigin?: boolean;
}

interface NetworkFlowMapProps {
  data: {
    origin: NetworkNode;
    layers: NetworkNode[][];
    connections: { from: string; to: string; strength: number }[];
  };
  onSelect: (id: string) => void;
  selectedId?: string;
}

function NetworkFlowMap({ data, onSelect, selectedId }: NetworkFlowMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollPos, setScrollPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const getNodeColor = (confidence: string, type: string) => {
    const baseColors = {
      'High': 'bg-emerald-500',
      'Mid': 'bg-amber-500', 
      'Low': 'bg-zinc-400'
    };
    return baseColors[confidence as keyof typeof baseColors] || 'bg-zinc-400';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'press': 'bg-blue-500',
      'community': 'bg-green-500',
      'aggregator': 'bg-teal-500',
      'blog': 'bg-purple-500',
      'corpPR': 'bg-orange-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  const NetworkNode = ({ 
    node, 
    x, 
    y, 
    isStart = false, 
    isEnd = false 
  }: { 
    node: NetworkNode; 
    x: number; 
    y: number;
    isStart?: boolean;
    isEnd?: boolean;
  }) => {
    const isSelected = selectedId === node.id;
    const isHovered = hoveredId === node.id;
    const nodeSize = node.isOrigin ? 80 : 60;
    
    return (
      <div
        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
        style={{ left: x, top: y }}
        onClick={() => onSelect(node.id)}
        onMouseEnter={() => setHoveredId(node.id)}
        onMouseLeave={() => setHoveredId(null)}
      >
        {/* Start/End labels */}
        {isStart && (
          <div className="absolute -left-16 top-1/2 -translate-y-1/2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            시작
          </div>
        )}
        {isEnd && (
          <div className="absolute -right-16 top-1/2 -translate-y-1/2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            마침
          </div>
        )}

        {/* Main node circle */}
        <div 
          className={`
            relative rounded-full flex items-center justify-center transition-all duration-200
            ${getTypeColor(node.type)} text-white shadow-lg
            ${isSelected ? 'ring-4 ring-blue-400 scale-110' : ''}
            ${isHovered ? 'scale-105 shadow-xl' : ''}
            ${node.isOrigin ? 'ring-2 ring-blue-600' : ''}
          `}
          style={{ 
            width: nodeSize, 
            height: nodeSize,
            opacity: hoveredId && !isHovered ? 0.6 : 1
          }}
        >
          <TypeIcon type={node.type} />
          
          {/* Confidence indicator */}
          <div 
            className={`
              absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white
              ${getNodeColor(node.confidence, node.type)}
            `}
          />
        </div>

        {/* Node details */}
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-center min-w-[120px]">
          <div className="text-xs font-medium text-gray-800 truncate max-w-[100px]">
            {node.title}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {node.domain}
          </div>
          <div className="text-xs text-gray-400">
            {Math.round(node.score * 100)}%
          </div>
        </div>

        {/* Sub-items (like in the image) */}
        <div className="absolute top-full mt-12 left-1/2 -translate-x-1/2 space-y-1">
          <div className="text-xs text-blue-600 cursor-pointer hover:underline">
            —내용 내용
          </div>
          <div className="text-xs text-blue-600 cursor-pointer hover:underline">
            —내용 내용
          </div>
        </div>
      </div>
    );
  };

  const ConnectionLine = ({ 
    from, 
    to, 
    strength 
  }: { 
    from: { x: number; y: number }; 
    to: { x: number; y: number }; 
    strength: number;
  }) => {
    const isHighlighted = hoveredId !== null;
    
    return (
      <svg 
        className="absolute inset-0 pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      >
        <line
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke={strength > 0.8 ? "#3b82f6" : strength > 0.5 ? "#10b981" : "#6b7280"}
          strokeWidth={strength > 0.8 ? 3 : 2}
          className="transition-all duration-200"
          opacity={isHighlighted ? 0.8 : 0.6}
        />
        
        {/* Arrow head */}
        <polygon
          points={`${to.x-8},${to.y-4} ${to.x},${to.y} ${to.x-8},${to.y+4}`}
          fill={strength > 0.8 ? "#3b82f6" : strength > 0.5 ? "#10b981" : "#6b7280"}
          opacity={isHighlighted ? 0.8 : 0.6}
        />
      </svg>
    );
  };

  // Layout calculation - increased width for better spacing
  const containerWidth = 1200;
  const containerHeight = 500;
  const layerWidth = containerWidth / (data.layers.length + 2); // +2 for origin and end space
  
  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || e.target === contentRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - scrollPos.x, y: e.clientY - scrollPos.y });
      e.preventDefault();
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setScrollPos({ x: newX, y: newY });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Mouse wheel scroll handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const step = e.deltaY > 0 ? -30 : 30;
    
    if (e.shiftKey || e.deltaX !== 0) {
      // Horizontal scroll with Shift + wheel or trackpad horizontal scroll
      const deltaX = e.deltaX !== 0 ? -e.deltaX : -e.deltaY;
      setScrollPos(prev => ({
        ...prev,
        x: Math.max(Math.min(prev.x + deltaX, 100), -(containerWidth - 600))
      }));
    } else {
      // Vertical scroll
      setScrollPos(prev => ({
        ...prev,
        y: Math.max(Math.min(prev.y - e.deltaY, 100), -(containerHeight - 400))
      }));
    }
  };
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 50;
      switch (e.key) {
        case 'ArrowLeft':
          setScrollPos(prev => ({ ...prev, x: Math.min(prev.x + step, 0) }));
          break;
        case 'ArrowRight':
          setScrollPos(prev => ({ ...prev, x: Math.max(prev.x - step, -(containerWidth - 600)) }));
          break;
        case 'ArrowUp':
          setScrollPos(prev => ({ ...prev, y: Math.min(prev.y + step, 0) }));
          break;
        case 'ArrowDown':
          setScrollPos(prev => ({ ...prev, y: Math.max(prev.y - step, -(containerHeight - 400)) }));
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [containerWidth, containerHeight]);
  
  const nodePositions = new Map<string, { x: number; y: number }>();
  
  // Position origin node
  nodePositions.set(data.origin.id, { 
    x: layerWidth, 
    y: containerHeight / 2 
  });

  // Position layer nodes
  data.layers.forEach((layer, layerIndex) => {
    const x = layerWidth * (layerIndex + 2);
    layer.forEach((node, nodeIndex) => {
      const y = (containerHeight / (layer.length + 1)) * (nodeIndex + 1);
      nodePositions.set(node.id, { x, y });
    });
  });

  return (
    <div className="w-full overflow-hidden rounded-2xl border bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-zinc-50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">정보 전파 네트워크</h3>
          <div className="flex items-center gap-4 text-xs text-zinc-600">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              높음
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              보통
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-zinc-400"></span>
              낮음
            </div>
          </div>
        </div>
      </div>

      {/* Network diagram container with scroll */}
      <div 
        ref={containerRef}
        className="relative bg-gray-50 overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ width: '100%', height: containerHeight }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        tabIndex={0}
      >
        {/* Scrollable content */}
        <div 
          ref={contentRef}
          className="relative transition-transform duration-100"
          style={{ 
            width: containerWidth, 
            height: containerHeight,
            transform: `translate(${scrollPos.x}px, ${scrollPos.y}px)`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
        {/* Connection lines */}
        {data.connections.map((conn, index) => {
          const fromPos = nodePositions.get(conn.from);
          const toPos = nodePositions.get(conn.to);
          if (!fromPos || !toPos) return null;
          
          return (
            <ConnectionLine
              key={index}
              from={fromPos}
              to={toPos}
              strength={conn.strength}
            />
          );
        })}

        {/* Curved connection lines (like in the image) */}
        <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
          {/* Top curve */}
          <path
            d={`M ${layerWidth * 3} ${containerHeight * 0.2} Q ${layerWidth * 4} ${containerHeight * 0.1} ${layerWidth * 5} ${containerHeight * 0.2}`}
            stroke="#10b981"
            strokeWidth="2"
            fill="none"
            opacity="0.6"
          />
          
          {/* Bottom curve */}
          <path
            d={`M ${layerWidth * 2} ${containerHeight * 0.8} Q ${layerWidth * 3.5} ${containerHeight * 0.9} ${layerWidth * 5} ${containerHeight * 0.8}`}
            stroke="#10b981"
            strokeWidth="2"
            fill="none"
            opacity="0.6"
          />
        </svg>

        {/* Origin node */}
        <NetworkNode
          node={data.origin}
          x={nodePositions.get(data.origin.id)!.x}
          y={nodePositions.get(data.origin.id)!.y}
          isStart={true}
        />

        {/* Layer nodes */}
        {data.layers.flat().map((node) => {
          const pos = nodePositions.get(node.id)!;
          return (
            <NetworkNode
              key={node.id}
              node={node}
              x={pos.x}
              y={pos.y}
              isEnd={data.layers[data.layers.length - 1].includes(node)}
            />
          );
        })}
        </div>
        
        {/* Scroll indicators */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <Move className="h-3 w-3" />
          드래그하여 이동
        </div>
        
        {/* Horizontal scroll bar */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-200">
          <div 
            className="h-full bg-blue-500 rounded"
            style={{
              width: `${Math.min(100, (600 / containerWidth) * 100)}%`,
              marginLeft: `${Math.max(0, (-scrollPos.x / (containerWidth - 600)) * (100 - (600 / containerWidth) * 100))}%`
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t bg-zinc-50 text-xs text-zinc-600">
        <div className="flex items-center justify-between">
          <span>노드 클릭으로 상세 분석 • 선 굵기는 연결 강도 • 색상은 소스 유형</span>
          <span className="text-zinc-500">드래그, 휠스크롤(Shift+휠=가로), 방향키로 이동</span>
        </div>
      </div>
    </div>
  );
}

export default NetworkFlowMap;