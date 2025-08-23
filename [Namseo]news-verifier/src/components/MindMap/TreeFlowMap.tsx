import React, { useState } from 'react';
import { Newspaper, Users, Share2, Globe, ArrowRight, Plus, Minus } from 'lucide-react';

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

interface TreeNode {
  id: string;
  title: string;
  domain: string;
  type: string;
  confidence: 'High' | 'Mid' | 'Low';
  score: number;
  timestamp: string;
  children?: TreeNode[];
  isOrigin?: boolean;
}

interface TreeFlowMapProps {
  data: {
    origin: TreeNode;
    propagation: TreeNode[];
  };
  onSelect: (id: string) => void;
  selectedId?: string;
}

function TreeFlowMap({ data, onSelect, selectedId }: TreeFlowMapProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([data.origin.id]));

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const DiagramNode = ({ 
    node, 
    level = 0,
    showConnector = false
  }: { 
    node: TreeNode; 
    level?: number;
    showConnector?: boolean;
  }) => {
    const isSelected = selectedId === node.id;
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    const confidenceColor = {
      'High': 'border-emerald-500 bg-emerald-50',
      'Mid': 'border-amber-500 bg-amber-50', 
      'Low': 'border-zinc-400 bg-zinc-50'
    }[node.confidence];

    const selectedStyle = isSelected ? 'ring-2 ring-blue-500 shadow-lg' : '';

    return (
      <div className="flex flex-col items-center">
        {/* Connector line from parent */}
        {showConnector && (
          <div className="flex flex-col items-center mb-4">
            <div className="w-px h-8 bg-zinc-300"></div>
            <ArrowRight className="h-4 w-4 text-zinc-400 rotate-90" />
          </div>
        )}

        {/* Node box */}
        <div 
          className={`
            relative flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer
            transition-all duration-200 min-w-[280px] max-w-[320px]
            ${confidenceColor} ${selectedStyle}
            hover:shadow-md
            ${node.isOrigin ? 'bg-blue-50 border-blue-500 font-medium' : ''}
          `}
          onClick={() => onSelect(node.id)}
        >
          {/* Expand/Collapse button */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
              className="flex-shrink-0 p-1 rounded hover:bg-white/70 transition-colors"
            >
              {isExpanded ? (
                <Minus className="h-4 w-4 text-zinc-600" />
              ) : (
                <Plus className="h-4 w-4 text-zinc-600" />
              )}
            </button>
          )}

          {/* Type icon */}
          <div className="flex-shrink-0">
            <TypeIcon type={node.type} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-medium truncate">{node.title}</h4>
              {node.isOrigin && (
                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                  발원지
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <span className="truncate">{node.domain}</span>
              <span>•</span>
              <span>신뢰도 {Math.round(node.score * 100)}%</span>
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              {new Date(node.timestamp).toLocaleString('ko-KR', { 
                month: 'short',
                day: 'numeric',
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>

          {/* Confidence badge */}
          <div className="flex-shrink-0">
            <span className={`
              text-xs px-2 py-1 rounded-full
              ${node.confidence === 'High' ? 'bg-emerald-500 text-white' :
                node.confidence === 'Mid' ? 'bg-amber-500 text-white' :
                'bg-zinc-500 text-white'}
            `}>
              {node.confidence}
            </span>
          </div>
        </div>

        {/* Children - displayed vertically below */}
        {hasChildren && isExpanded && (
          <div className="mt-4 space-y-4 flex flex-col items-center">
            {node.children!.map((child) => (
              <DiagramNode
                key={child.id}
                node={child}
                level={level + 1}
                showConnector={true}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-zinc-50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">정보 전파 경로</h3>
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

      {/* Diagram content */}
      <div className="p-6 max-h-[500px] overflow-y-auto">
        <div className="flex flex-col items-center space-y-6">
          {/* Origin node */}
          <DiagramNode node={data.origin} />
          
          {/* Propagation nodes */}
          {data.propagation.map((node) => (
            <DiagramNode
              key={node.id}
              node={node}
              level={1}
              showConnector={true}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t bg-zinc-50 text-xs text-zinc-600">
        클릭하여 상세 분석 확인 • +/- 버튼으로 하위 전파 경로 펼치기
      </div>
    </div>
  );
}

export default TreeFlowMap;
