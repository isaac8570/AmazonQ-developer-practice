"use client";

import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Search, Bell, Share2, Save, Globe, Newspaper, Users, Clock, Link2 } from "lucide-react";
import NetworkFlowMap from "@/components/MindMap/NetworkFlowMap";
import EnhancedEvidencePanel from "@/components/Evidence/EnhancedEvidencePanel";

/**
 * TraceFirst – MVP Wireframe (single-file React prototype)
 * - Left: Cluster list (search results / watchlist)
 * - Center: Cluster detail with Timeline & Origin Map(mindmap) tabs
 * - Right: Evidence/Signals panel (TraceScore breakdown & timestamp confidence)
 *
 * Styling: Tailwind + shadcn/ui, minimal yet production-like containers.
 */

// -----------------------
// Mock Data (for wireframe)
// -----------------------
const MOCK_CLUSTERS = [
  {
    id: "c1",
    label: "신형 폰 배터리 발화 루머(예시)",
    size: 18,
    firstSeen: "2025-08-23T09:12:00Z",
    preview: "커뮤니티 A 게시글 이후 다수 매체 인용…",
    candidates: [
      { id: "a1", domain: "ppomppu.co.kr", type: "community", ts: "2025-08-23T09:12:00Z", confidence: "High", title: "[제보] 신형 폰 발열/발화?", url: "#" },
      { id: "a2", domain: "technews.example", type: "press", ts: "2025-08-23T10:05:00Z", confidence: "Mid", title: "신형 폰 발열 이슈 보도", url: "#" },
      { id: "a3", domain: "agg.today", type: "aggregator", ts: "2025-08-23T10:22:00Z", confidence: "Low", title: "SNS 모아보기", url: "#" },
    ],
  },
  {
    id: "c2",
    label: "게임 업데이트 보안 취약점 논란(예시)",
    size: 11,
    firstSeen: "2025-08-22T23:40:00Z",
    preview: "보도자료 → 커뮤니티 확산",
    candidates: [
      { id: "b1", domain: "corppr.example", type: "corpPR", ts: "2025-08-22T23:40:00Z", confidence: "High", title: "긴급 공지: 보안 패치", url: "#" },
      { id: "b2", domain: "dcinside.com", type: "community", ts: "2025-08-23T00:05:00Z", confidence: "Mid", title: "패치 이후 문제?", url: "#" },
    ],
  },
];

const MOCK_ARTICLES_C1 = {
  id: "c1",
  timeline: [
    { id: "a1", ts: "2025-08-23T09:12:00Z", label: "커뮤니티 A 최초 게시", type: "community", confidence: "High", domain: "ppomppu.co.kr" },
    { id: "a2", ts: "2025-08-23T10:05:00Z", label: "TechNews 단독 보도", type: "press", confidence: "Mid", domain: "technews.example" },
    { id: "a4", ts: "2025-08-23T10:18:00Z", label: "언론 B 인용 보도", type: "press", confidence: "High", domain: "news.example" },
    { id: "a3", ts: "2025-08-23T10:22:00Z", label: "집계 사이트 모아보기", type: "aggregator", confidence: "Low", domain: "agg.today" },
    { id: "a5", ts: "2025-08-23T11:10:00Z", label: "언론 C 후속 보도", type: "press", confidence: "High", domain: "press.example" },
  ],
  // Simplified mindmap graph (pre-laid radial coordinates for wireframe)
  mindmap: {
    center: [
      { id: "a1", title: "ppomppu 최초 글", type: "community", score: 0.86, confidence: "High" },
      { id: "a2", title: "TechNews 기사", type: "press", score: 0.74, confidence: "Mid" },
    ],
    ring1: [
      { id: "n1", title: "news.example", type: "press", score: 0.62, confidence: "High" },
      { id: "n2", title: "agg.today", type: "aggregator", score: 0.38, confidence: "Low" },
      { id: "n3", title: "blog.tistory", type: "blog", score: 0.44, confidence: "Mid" },
      { id: "n4", title: "forumB", type: "community", score: 0.41, confidence: "Mid" },
    ],
    ring2: [
      { id: "m1", title: "localpress.kr", type: "press", score: 0.35, confidence: "High" },
      { id: "m2", title: "press-crawler", type: "aggregator", score: 0.22, confidence: "Low" },
      { id: "m3", title: "sns-digest", type: "aggregator", score: 0.20, confidence: "Low" },
      { id: "m4", title: "reviewblog", type: "blog", score: 0.27, confidence: "Mid" },
    ],
    edges: [
      { src: "a1", dst: "a2", reason: "via ppomppu", weight: 1 },
      { src: "a2", dst: "n1", reason: "according to TechNews", weight: 1 },
      { src: "a2", dst: "n2", reason: "link", weight: 1 },
      { src: "n1", dst: "m1", reason: "cite", weight: 1 },
      { src: "n2", dst: "m2", reason: "aggregate", weight: 0.7 },
      { src: "n3", dst: "m4", reason: "blog cite", weight: 0.7 },
      { src: "a1", dst: "n4", reason: "community copy", weight: 0.6 },
    ],
  },
  // Network flow structure for horizontal propagation
  networkFlow: {
    origin: {
      id: "a1",
      title: "[제보] 신형 폰 발열/발화?",
      domain: "ppomppu.co.kr",
      type: "community",
      confidence: "High" as const,
      score: 0.86,
      timestamp: "2025-08-23T09:12:00Z",
      isOrigin: true
    },
    layers: [
      [
        {
          id: "a2",
          title: "신형 폰 발열 이슈 보도",
          domain: "technews.example",
          type: "press",
          confidence: "Mid" as const,
          score: 0.74,
          timestamp: "2025-08-23T10:05:00Z"
        },
        {
          id: "n4",
          title: "커뮤니티 B 재게시",
          domain: "forumB.com",
          type: "community",
          confidence: "Mid" as const,
          score: 0.41,
          timestamp: "2025-08-23T09:45:00Z"
        }
      ],
      [
        {
          id: "a4",
          title: "언론 B 인용 보도",
          domain: "news.example",
          type: "press",
          confidence: "High" as const,
          score: 0.62,
          timestamp: "2025-08-23T10:18:00Z"
        },
        {
          id: "a3",
          title: "SNS 모아보기",
          domain: "agg.today",
          type: "aggregator",
          confidence: "Low" as const,
          score: 0.38,
          timestamp: "2025-08-23T10:22:00Z"
        },
        {
          id: "m4",
          title: "개인 블로그 리뷰",
          domain: "reviewblog.tistory.com",
          type: "blog",
          confidence: "Mid" as const,
          score: 0.27,
          timestamp: "2025-08-23T12:15:00Z"
        }
      ],
      [
        {
          id: "m1",
          title: "지역 언론 후속 보도",
          domain: "localpress.kr",
          type: "press",
          confidence: "High" as const,
          score: 0.35,
          timestamp: "2025-08-23T11:30:00Z"
        },
        {
          id: "m2",
          title: "언론 크롤링 사이트",
          domain: "press-crawler.com",
          type: "aggregator",
          confidence: "Low" as const,
          score: 0.22,
          timestamp: "2025-08-23T10:45:00Z"
        }
      ]
    ],
    connections: [
      { from: "a1", to: "a2", strength: 0.9 },
      { from: "a1", to: "n4", strength: 0.7 },
      { from: "a2", to: "a4", strength: 0.8 },
      { from: "a2", to: "a3", strength: 0.6 },
      { from: "n4", to: "m4", strength: 0.5 },
      { from: "a4", to: "m1", strength: 0.7 },
      { from: "a3", to: "m2", strength: 0.4 }
    ]
  },
  evidence: {
    selectedArticleId: "a2",
    scoreBreakdown: {
      SOURCE: { value: 0.65, evidence: ["TechNews - 중간 신뢰도 언론사", "도메인 평판 78점", "기자 이력 확인됨"], confidence: "medium" as const },
      FACT: { value: 0.72, evidence: ["1차 출처(커뮤니티) 확인", "제조사 공식 입장 미확인", "사실 검증 부분적"], confidence: "medium" as const },
      BIAS: { value: 0.58, evidence: ["중립적 어조", "감정적 표현 일부 포함", "균형잡힌 시각 부족"], confidence: "medium" as const },
      TRANSPARENCY: { value: 0.85, evidence: ["기자명 명시", "발행시간 정확", "수정 이력 투명"], confidence: "high" as const },
      CONTEXT: { value: 0.45, evidence: ["배경 설명 부족", "관련 정보 제한적", "업데이트 없음"], confidence: "low" as const }
    },
    timestamps: {
      t_claimed: "2025-08-23 10:05 KST",
      t_archive: "2025-08-23 10:09 KST", 
      t_seen: "2025-08-23 10:06 KST",
      confidence: "High" as const,
      discrepancies: []
    },
    citations: {
      inbound: [
        { source: "news.example", anchor: "TechNews에 따르면", url: "#", confidence: 0.9 },
        { source: "localpress.kr", anchor: "앞서 보도된 바와 같이", url: "#", confidence: 0.8 },
        { source: "agg.today", anchor: "관련 기사", url: "#", confidence: 0.6 }
      ],
      outbound: [
        { target: "ppomppu.co.kr", anchor: "커뮤니티 제보", url: "#", verified: true },
        { target: "manufacturer.com", anchor: "공식 입장", url: "#", verified: false }
      ]
    },
    verification: {
      waybackStatus: "verified" as const,
      metadataConsistency: 0.95,
      domainReputation: 0.78
    }
  },
};

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

// Confidence color ring
function confidenceColor(c: string) {
  return c === "High" ? "ring-emerald-500" : c === "Mid" ? "ring-amber-500" : "ring-zinc-400";
}

// -----------------------
// UI Components
// -----------------------
function HeaderBar({ onSearch }: { onSearch: (q: string) => void }) {
  const [q, setQ] = useState("");
  return (
    <div className="sticky top-0 z-30 w-full backdrop-blur bg-white/70 border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="font-bold text-xl tracking-tight">TraceFirst</div>
        <div className="text-xs text-zinc-500 hidden md:block">발원 추적 · 타임라인 · 마인드맵</div>
        <div className="flex-1" />
        <div className="relative w-[360px] hidden md:block">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch(q)}
            placeholder="키워드 또는 기사 URL을 입력…"
            className="pl-8"
          />
        </div>
        <Button variant="outline" className="gap-2"><Bell className="h-4 w-4"/>워치리스트</Button>
      </div>
    </div>
  );
}

function ClusterList({ clusters, onPick, activeId }: any) {
  const handleWheel = (e: React.WheelEvent) => {
    if (e.shiftKey) {
      e.preventDefault();
      const container = e.currentTarget as HTMLElement;
      container.scrollLeft += e.deltaY;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">정보 그룹<span className="text-zinc-400"> · {clusters.length}</span></CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div 
          className="h-[68vh] overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          onWheel={handleWheel}
        >
          <div className="space-y-2 min-w-[280px]">
            {clusters.map((c: any) => (
              <button
                key={c.id}
                onClick={() => onPick(c.id)}
                className={`w-full text-left group rounded-2xl p-3 border hover:shadow-sm transition ${activeId===c.id?"border-zinc-900 bg-zinc-50":"border-zinc-200"}`}
              >
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-full px-2 py-0.5">{c.size}</Badge>
                  <div className="font-medium truncate">{c.label}</div>
                </div>
                <div className="text-xs text-zinc-500 mt-1 truncate">{c.preview}</div>
                <div className="flex gap-2 mt-2 overflow-x-auto">
                  {c.candidates.slice(0,3).map((k: any) => (
                    <TooltipProvider key={k.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={`text-[10px] px-2 py-1 rounded-full border whitespace-nowrap ${activeId===c.id?"bg-white":"bg-zinc-50"}`}>
                            <span className={`inline-flex items-center gap-1`}>
                              <span className={`inline-block h-2 w-2 rounded-full ${k.confidence==='High'?'bg-emerald-500':k.confidence==='Mid'?'bg-amber-500':'bg-zinc-400'}`}></span>
                              <TypeIcon type={k.type} />
                              <span className="text-zinc-600">{k.domain}</span>
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs space-y-1">
                            <div className="font-medium">{k.title}</div>
                            <div className="text-zinc-500">{new Date(k.ts).toLocaleString()}</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TimelineView({ items }: { items: any[] }) {
  const handleWheel = (e: React.WheelEvent) => {
    if (e.shiftKey) {
      e.preventDefault();
      const container = e.currentTarget as HTMLElement;
      container.scrollLeft += e.deltaY;
    }
  };

  return (
    <div 
      className="relative overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      onWheel={handleWheel}
    >
      <div className="min-w-[600px] relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-zinc-200" />
        <div className="space-y-4">
          {items.map((it, idx) => (
            <div key={it.id} className="pl-10">
              <div className="flex items-start gap-3">
                <div className={`mt-1 h-3 w-3 rounded-full ring-2 ${confidenceColor(it.confidence)} bg-white`}></div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium flex items-center gap-2">
                    <TypeIcon type={it.type}/> 
                    <span className="truncate">{it.label}</span>
                  </div>
                  <div className="text-xs text-zinc-500 flex items-center gap-1">
                    <Clock className="h-3 w-3"/>
                    <span className="whitespace-nowrap">{new Date(it.ts).toLocaleString()}</span>
                    <span>·</span>
                    <span className="truncate">{it.domain}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState("c1");
  const [tab, setTab] = useState("timeline");
  const activeCluster = useMemo(()=>MOCK_CLUSTERS.find(c=>c.id===active)!, [active]);
  const data = MOCK_ARTICLES_C1; // wireframe: use one dataset

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50">
        <HeaderBar onSearch={() => { /* noop for wireframe */ }} />
        <main className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-12 gap-4">
          {/* Left: Cluster List */}
          <section className="col-span-12 md:col-span-3">
            <ClusterList clusters={MOCK_CLUSTERS} onPick={setActive} activeId={active} />
          </section>

          {/* Center: Detail */}
          <section className="col-span-12 md:col-span-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{activeCluster.label}</CardTitle>
                    <div className="text-xs text-zinc-500">발원 후보 Top3 · 건수 {activeCluster.size}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1"><Save className="h-4 w-4"/>케이스북 저장</Button>
                    <Button variant="outline" size="sm" className="gap-1"><Share2 className="h-4 w-4"/>임베드</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={tab} onValueChange={setTab}>
                  <TabsList>
                    <TabsTrigger value="timeline">타임스탬프</TabsTrigger>
                    <TabsTrigger value="map">전파 경로</TabsTrigger>
                  </TabsList>
                  <div className="mt-4"/>
                  <TabsContent value="timeline">
                    <div className="text-xs text-zinc-500 mb-2">
                      Shift+휠스크롤로 가로 이동 가능
                    </div>
                    <TimelineView items={data.timeline} />
                  </TabsContent>
                  <TabsContent value="map">
                    <NetworkFlowMap 
                      data={data.networkFlow} 
                      onSelect={(id) => {
                        // In real app, update evidence panel with selected article
                        console.log('Selected article:', id);
                      }} 
                      selectedId={data.evidence.selectedArticleId}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </section>

          {/* Right: Evidence/Signals */}
          <section className="col-span-12 md:col-span-3">
            <EnhancedEvidencePanel ev={data.evidence} />
          </section>
        </main>

        {/* Footer Mini Legend */}
        <div className="max-w-7xl mx-auto px-4 pb-6 text-[11px] text-zinc-500 flex items-center gap-4">
          <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500 inline-block"></span>Confidence High</div>
          <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500 inline-block"></span>Mid</div>
          <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-zinc-400 inline-block"></span>Low</div>
          <div className="text-zinc-400 ml-4">Shift+휠스크롤로 가로 이동</div>
        </div>
      </div>
    </TooltipProvider>
  );
}
