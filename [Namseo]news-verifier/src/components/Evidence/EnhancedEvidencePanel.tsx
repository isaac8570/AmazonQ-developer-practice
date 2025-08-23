import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ExternalLink, Archive, Link2, AlertTriangle, CheckCircle } from "lucide-react";

interface ScoreBreakdown {
  SOURCE: { value: number; evidence: string[]; confidence: 'high' | 'medium' | 'low' };
  FACT: { value: number; evidence: string[]; confidence: 'high' | 'medium' | 'low' };
  BIAS: { value: number; evidence: string[]; confidence: 'high' | 'medium' | 'low' };
  TRANSPARENCY: { value: number; evidence: string[]; confidence: 'high' | 'medium' | 'low' };
  CONTEXT: { value: number; evidence: string[]; confidence: 'high' | 'medium' | 'low' };
}

interface EnhancedEvidenceData {
  selectedArticleId: string;
  scoreBreakdown: ScoreBreakdown;
  timestamps: {
    t_claimed: string;
    t_archive: string;
    t_seen: string;
    confidence: 'High' | 'Mid' | 'Low';
    discrepancies?: string[];
  };
  citations: {
    inbound: Array<{ source: string; anchor: string; url: string; confidence: number }>;
    outbound: Array<{ target: string; anchor: string; url: string; verified: boolean }>;
  };
  verification: {
    waybackStatus: 'verified' | 'partial' | 'missing';
    metadataConsistency: number;
    domainReputation: number;
    editHistory?: Array<{ timestamp: string; change: string }>;
  };
}

function EnhancedEvidencePanel({ ev }: { ev: EnhancedEvidenceData }) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const ScoreComponent = ({ 
    label, 
    data, 
    isNegative = false 
  }: { 
    label: string; 
    data: { value: number; evidence: string[]; confidence: 'high' | 'medium' | 'low' }; 
    isNegative?: boolean 
  }) => {
    const sectionKey = `score-${label}`;
    const isExpanded = expandedSections.has(sectionKey);
    
    return (
      <Collapsible>
        <CollapsibleTrigger 
          className="w-full"
          onClick={() => toggleSection(sectionKey)}
        >
          <div className="flex items-center justify-between p-2 hover:bg-zinc-50 rounded">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{label}</span>
              <Badge 
                variant={data.confidence === 'high' ? 'default' : data.confidence === 'medium' ? 'secondary' : 'outline'}
                className="text-xs"
              >
                {data.confidence}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-600">
                {isNegative ? '-' : ''}{Math.round(data.value * 100)}%
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </CollapsibleTrigger>
        
        <div className="px-2">
          <Progress 
            value={isNegative ? (100 - data.value * 100) : (data.value * 100)} 
            className="h-2 mb-2" 
          />
        </div>

        <CollapsibleContent>
          <div className="px-2 pb-2 space-y-1">
            {data.evidence.map((evidence, i) => (
              <div key={i} className="text-xs text-zinc-600 flex items-start gap-2">
                <CheckCircle className="h-3 w-3 mt-0.5 text-emerald-500 flex-shrink-0" />
                <span>{evidence}</span>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          신뢰도 분석
          <Badge variant="outline" className="text-xs">
            ID: {ev.selectedArticleId}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Overall Confidence Score */}
        <div className="text-center py-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border">
          <div className="text-3xl font-bold text-indigo-600 mb-1">
            {Math.round((ev.scoreBreakdown.SOURCE.value * 0.3 + ev.scoreBreakdown.FACT.value * 0.25 + ev.scoreBreakdown.BIAS.value * 0.2 + ev.scoreBreakdown.TRANSPARENCY.value * 0.15 + ev.scoreBreakdown.CONTEXT.value * 0.1) * 100)}%
          </div>
          <div className="text-sm text-zinc-600">전체 신뢰도</div>
        </div>

        <Separator />

        {/* TraceScore Breakdown */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-zinc-700 mb-3">신뢰도 점수 분석</div>
          
          <ScoreComponent label="출처 신뢰도" data={ev.scoreBreakdown.SOURCE} />
          <ScoreComponent label="사실 확인" data={ev.scoreBreakdown.FACT} />
          <ScoreComponent label="편향성 분석" data={ev.scoreBreakdown.BIAS} />
          <ScoreComponent label="투명성" data={ev.scoreBreakdown.TRANSPARENCY} />
          <ScoreComponent label="맥락 정보" data={ev.scoreBreakdown.CONTEXT} />
        </div>

        <Separator />

        {/* Timestamp Analysis */}
        <Collapsible>
          <CollapsibleTrigger 
            className="w-full"
            onClick={() => toggleSection('timestamps')}
          >
            <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-zinc-700">시간 정보 분석</div>
              <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.has('timestamps') ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="space-y-2 mt-2">
              <div className="text-sm">
                <span className="text-zinc-500">발행 시각:</span>
                <span className="font-mono ml-2">{ev.timestamps.t_claimed}</span>
              </div>
              <div className="text-sm">
                <span className="text-zinc-500">보관 시각:</span>
                <span className="font-mono ml-2">{ev.timestamps.t_archive}</span>
              </div>
              <div className="text-sm">
                <span className="text-zinc-500">수집 시각:</span>
                <span className="font-mono ml-2">{ev.timestamps.t_seen}</span>
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-zinc-500">신뢰도:</span>
                <Badge className={
                  ev.timestamps.confidence === 'High' ? "bg-emerald-500" : 
                  ev.timestamps.confidence === 'Mid' ? "bg-amber-500" : "bg-zinc-500"
                }>
                  {ev.timestamps.confidence}
                </Badge>
              </div>

              {ev.timestamps.discrepancies && ev.timestamps.discrepancies.length > 0 && (
                <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
                  <div className="flex items-center gap-1 text-xs text-amber-700 mb-1">
                    <AlertTriangle className="h-3 w-3" />
                    시간 불일치 감지
                  </div>
                  {ev.timestamps.discrepancies.map((disc, i) => (
                    <div key={i} className="text-xs text-amber-600">{disc}</div>
                  ))}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Citation Analysis */}
        <Collapsible>
          <CollapsibleTrigger 
            className="w-full"
            onClick={() => toggleSection('citations')}
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-zinc-700">인용 관계</div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  인용됨 {ev.citations.inbound.length}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  인용함 {ev.citations.outbound.length}
                </Badge>
                <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.has('citations') ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="space-y-3 mt-2">
              {/* Inbound citations */}
              <div>
                <div className="text-xs text-zinc-500 mb-2">이 기사를 인용한 매체</div>
                {ev.citations.inbound.map((citation, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-zinc-50 rounded text-xs">
                    <div>
                      <div className="font-medium">{citation.source}</div>
                      <div className="text-zinc-500">"{citation.anchor}"</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Progress value={citation.confidence * 100} className="w-12 h-1" />
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Outbound citations */}
              <div>
                <div className="text-xs text-zinc-500 mb-2">이 기사가 인용한 출처</div>
                {ev.citations.outbound.map((citation, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-zinc-50 rounded text-xs">
                    <div>
                      <div className="font-medium">{citation.target}</div>
                      <div className="text-zinc-500">"{citation.anchor}"</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {citation.verified ? (
                        <CheckCircle className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                      )}
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Verification Status */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-zinc-700">검증 상태</div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span>보관 상태</span>
              <Badge variant={
                ev.verification.waybackStatus === 'verified' ? 'default' :
                ev.verification.waybackStatus === 'partial' ? 'secondary' : 'destructive'
              }>
                {ev.verification.waybackStatus === 'verified' ? '확인됨' :
                 ev.verification.waybackStatus === 'partial' ? '일부' : '없음'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>메타데이터</span>
              <span className="text-zinc-600">
                {Math.round(ev.verification.metadataConsistency * 100)}%
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>도메인 신뢰도</span>
              <span className="text-zinc-600">
                {Math.round(ev.verification.domainReputation * 100)}%
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Action Links */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-zinc-700">검증 링크</div>
          <div className="grid grid-cols-1 gap-2">
            <Button variant="outline" size="sm" className="justify-start gap-2 h-8">
              <ExternalLink className="h-3 w-3" />
              원문 보기
            </Button>
            <Button variant="outline" size="sm" className="justify-start gap-2 h-8">
              <Archive className="h-3 w-3" />
              보관 기록 보기
            </Button>
            <Button variant="outline" size="sm" className="justify-start gap-2 h-8">
              <Link2 className="h-3 w-3" />
              인용 네트워크
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default EnhancedEvidencePanel;
