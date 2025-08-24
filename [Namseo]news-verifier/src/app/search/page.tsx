"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Search, Bell, Share2, Save, Globe, Newspaper, Users, Clock, Link2, Loader2 } from "lucide-react";
import NetworkFlowMap from "@/components/MindMap/NetworkFlowMap";
import EnhancedEvidencePanel from "@/components/Evidence/EnhancedEvidencePanel";
import { useSearchParams } from "next/navigation";
import { api, type Cluster } from "@/lib/api";





function TypeIcon({ type }: { type: string }) {
  const className = "h-4 w-4";
  switch (type) {
    case "press": return <Newspaper className={className} />;
    case "community": return <Users className={className} />;
    case "aggregator": return <Share2 className={className} />;
    case "blog": return <Globe className={className} />;
    default: return <Globe className={className} />;
  }
}

function confidenceColor(c: string) {
  return c === "High" ? "ring-emerald-500" : c === "Mid" ? "ring-amber-500" : "ring-zinc-400";
}

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
  const validClusters = Array.isArray(clusters) ? clusters : [];
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">정보 그룹<span className="text-zinc-400"> · {validClusters.length}</span></CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[68vh] overflow-y-auto space-y-2">
          {validClusters.map((c: any) => (
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
                {(c.candidates || c.articles || []).slice(0,3).map((k: any, idx: number) => (
                  <TooltipProvider key={k.id || idx}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={`text-[10px] px-2 py-1 rounded-full border whitespace-nowrap ${activeId===c.id?"bg-white":"bg-zinc-50"}`}>
                          <span className="inline-flex items-center gap-1">
                            <span className={`inline-block h-2 w-2 rounded-full ${k.confidence==='High'?'bg-emerald-500':k.confidence==='Mid'?'bg-amber-500':'bg-zinc-400'}`}></span>
                            <TypeIcon type={k.type || k.source_type || 'press'} />
                            <span className="text-zinc-600">{k.domain || 'unknown'}</span>
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs space-y-1">
                          <div className="font-medium">{k.title || 'No title'}</div>
                          <div className="text-zinc-500">{k.ts ? new Date(k.ts).toLocaleString() : k.timestamp ? new Date(k.timestamp).toLocaleString() : 'No date'}</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TimelineView({ items }: { items: any[] }) {
  return (
    <div className="relative overflow-x-auto">
      <div className="min-w-[600px] relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-zinc-200" />
        <div className="space-y-4">
          {items.map((it) => (
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

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("");
  const [tab, setTab] = useState("timeline");
  
  const activeCluster = useMemo(() => {
    if (!clusters || clusters.length === 0) return null;
    return clusters.find(c => c.id === active) || clusters[0];
  }, [clusters, active]);

  useEffect(() => {
    if (query) {
      searchClusters(query);
    }
  }, [query]);

  const searchClusters = async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await api.search({ 
        query: searchQuery, 
        sources: ['news', 'community'] 
      });
      
      // Validate response structure
      if (response?.clusters && Array.isArray(response.clusters) && response.clusters.length > 0) {
        // Ensure each cluster has articles array
        const validClusters = response.clusters.map(cluster => ({
          ...cluster,
          articles: Array.isArray(cluster.articles) ? cluster.articles : []
        }));
        setClusters(validClusters);
        setActive(validClusters[0].id);
      } else {
        throw new Error('No valid clusters found');
      }
    } catch (error) {
      console.error('Search failed:', error);
      setClusters([]);
      setActive('');
    } finally {
      setLoading(false);
    }
  };

  // Convert cluster data to timeline format
  const timelineData = useMemo(() => {
    if (!activeCluster || !activeCluster.articles || !Array.isArray(activeCluster.articles)) {
      return [];
    }
    return activeCluster.articles.map(article => ({
      id: article.id,
      ts: article.timestamp,
      label: article.title,
      type: article.source_type,
      confidence: article.confidence,
      domain: article.domain
    }));
  }, [activeCluster]);

  // Convert to network flow format
  const networkFlowData = useMemo(() => {
    if (!activeCluster?.articles || !Array.isArray(activeCluster.articles) || activeCluster.articles.length === 0) {
      return null;
    }
    
    const articles = activeCluster.articles;
    
    // Sort by timestamp to find origin
    const sortedArticles = [...articles].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    return {
      origin: {
        id: sortedArticles[0].id,
        title: sortedArticles[0].title,
        domain: sortedArticles[0].domain,
        type: sortedArticles[0].source_type,
        confidence: sortedArticles[0].confidence as any,
        score: 0.86,
        timestamp: sortedArticles[0].timestamp,
        isOrigin: true
      },
      layers: [
        sortedArticles.slice(1, 3).map(article => ({
          id: article.id,
          title: article.title,
          domain: article.domain,
          type: article.source_type,
          confidence: article.confidence as any,
          score: 0.7,
          timestamp: article.timestamp
        }))
      ],
      connections: []
    };
  }, [activeCluster]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-zinc-600">검색 중...</p>
        </div>
      </div>
    );
  }

  if (!activeCluster || clusters.length === 0) {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50">
          <HeaderBar onSearch={() => {}} />
          <div className="flex items-center justify-center h-[80vh]">
            <div className="text-center">
              <p className="text-xl text-zinc-600 mb-2">현재 데이터를 불러올 수 없습니다</p>
              <p className="text-sm text-zinc-500">백엔드 서버를 확인하거나 다른 검색어를 시도해보세요.</p>
            </div>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50">
        <HeaderBar onSearch={() => {}} />
        <main className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-12 gap-4">
          <section className="col-span-12 md:col-span-3">
            <ClusterList clusters={clusters} onPick={setActive} activeId={active} />
          </section>

          <section className="col-span-12 md:col-span-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{activeCluster?.label || '검색 결과'}</CardTitle>
                    <div className="text-xs text-zinc-500">발원 후보 Top3 · 건수 {activeCluster?.size || 0}</div>
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
                    <TimelineView items={timelineData} />
                  </TabsContent>
                  <TabsContent value="map">
                    {networkFlowData ? (
                      <NetworkFlowMap 
                        data={networkFlowData} 
                        onSelect={(id) => console.log('Selected:', id)} 
                        selectedId={activeCluster?.articles?.[0]?.id || ''}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-64">
                        <p className="text-zinc-500">전파 경로 데이터가 없습니다.</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </section>

          <section className="col-span-12 md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">증거 분석</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-zinc-500 py-8">
                  증거 데이터가 없습니다.
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </TooltipProvider>
  );
}