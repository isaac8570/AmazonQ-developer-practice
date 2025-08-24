"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, Clock, Users, Newspaper } from "lucide-react";
import { useRouter } from "next/navigation";

const TRENDING_TOPICS = [
  { id: 1, title: "신형 폰 배터리 발화 루머", count: 18, trend: "up", category: "tech" },
  { id: 2, title: "게임 업데이트 보안 취약점", count: 11, trend: "up", category: "security" },
  { id: 3, title: "정치인 발언 논란", count: 24, trend: "down", category: "politics" },
  { id: 4, title: "경제 정책 변화", count: 8, trend: "stable", category: "economy" },
];

const RECENT_SEARCHES = [
  "배터리 발화",
  "보안 패치",
  "정치 논란",
  "경제 정책"
];

export default function HomePage() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50">
      {/* Header */}
      <div className="w-full border-b bg-white/70 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-2">TraceFirst</h1>
            <p className="text-zinc-600 mb-8">뉴스와 정보의 발원지를 추적하고 전파 경로를 분석합니다</p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-4 h-5 w-5 text-zinc-500" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="키워드, 기사 제목, 또는 URL을 입력하세요..."
                className="pl-12 pr-24 py-6 text-lg border-2 focus:border-blue-500"
              />
              <Button 
                onClick={handleSearch}
                className="absolute right-2 top-2 px-6"
              >
                검색
              </Button>
            </div>
            
            {/* Recent Searches */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="text-sm text-zinc-500">최근 검색:</span>
              {RECENT_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setQuery(term);
                    router.push(`/search?q=${encodeURIComponent(term)}`);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Trending Topics */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-6 w-6 text-orange-500" />
            <h2 className="text-2xl font-semibold">실시간 트렌드</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TRENDING_TOPICS.map((topic) => (
              <Card key={topic.id} className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/search?q=${encodeURIComponent(topic.title)}`)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{topic.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Newspaper className="h-4 w-4" />
                          {topic.count}개 기사
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {topic.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {topic.trend === "up" && <TrendingUp className="h-5 w-5 text-green-500" />}
                      {topic.trend === "down" && <TrendingUp className="h-5 w-5 text-red-500 rotate-180" />}
                      {topic.trend === "stable" && <div className="h-5 w-5 bg-zinc-400 rounded-full" />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">주요 기능</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  발원 추적
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-600">정보의 최초 출처를 찾아 시간순으로 전파 경로를 추적합니다.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-500" />
                  신뢰도 분석
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-600">출처의 신뢰도와 정보의 정확성을 다각도로 분석합니다.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  전파 시각화
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-600">정보의 확산 패턴을 직관적인 그래프로 시각화합니다.</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
