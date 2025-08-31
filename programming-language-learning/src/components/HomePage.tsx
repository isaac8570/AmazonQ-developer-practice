import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { languages } from '../data/languages';
import { useProgress } from '../hooks/useProgress';

interface HomePageProps {
  onLanguageSelect: (language: Language) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onLanguageSelect }) => {
  const { getTotalStats } = useProgress('');
  const [stats, setStats] = useState({ totalXp: 0, totalLessons: 0, maxStreak: 0 });

  useEffect(() => {
    setStats(getTotalStats());
  }, [getTotalStats]);

  return (
    <div className="min-h-screen relative overflow-hidden p-6">
      {/* 몽환적 배경 */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
      
      {/* 떠다니는 원형 배경 요소들 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-6000"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <header className="text-center mb-12">
          <div className="backdrop-blur-md bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
            <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
              🎓 CodeLingo
            </h1>
            <p className="text-xl text-white/90 drop-shadow-md">
              듀오링고처럼 재미있게 프로그래밍을 배워보세요!
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {languages.map((language) => (
            <div
              key={language.id}
              className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 shadow-2xl border border-white/20 cursor-pointer transform hover:scale-105 hover:bg-white/15 transition-all duration-300 group"
              onClick={() => onLanguageSelect(language)}
            >
              <div className="flex items-center mb-4">
                <div 
                  className="text-5xl mr-4 p-3 rounded-2xl backdrop-blur-sm shadow-lg group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: `${language.color}20` }}
                >
                  {language.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white drop-shadow-md">
                    {language.name}
                  </h3>
                  <p className="text-white/80 text-sm drop-shadow-sm">
                    {language.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="w-full bg-white/20 rounded-full h-3 mr-3 backdrop-blur-sm">
                    <div 
                      className="h-3 rounded-full shadow-lg transition-all duration-300"
                      style={{ 
                        width: '0%',
                        background: `linear-gradient(90deg, ${language.color}, ${language.color}aa)`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-white/70 font-medium">0% 완료</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
          <h2 className="text-3xl font-semibold text-white mb-6 text-center drop-shadow-lg">
            📊 학습 현황
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center backdrop-blur-sm bg-white/10 rounded-2xl p-4 border border-white/10">
              <div className="text-4xl font-bold text-orange-400 drop-shadow-lg mb-2">{stats.maxStreak}</div>
              <div className="text-white/90 font-medium">연속 학습일</div>
            </div>
            <div className="text-center backdrop-blur-sm bg-white/10 rounded-2xl p-4 border border-white/10">
              <div className="text-4xl font-bold text-cyan-400 drop-shadow-lg mb-2">{stats.totalXp}</div>
              <div className="text-white/90 font-medium">총 경험치</div>
            </div>
            <div className="text-center backdrop-blur-sm bg-white/10 rounded-2xl p-4 border border-white/10">
              <div className="text-4xl font-bold text-green-400 drop-shadow-lg mb-2">{stats.totalLessons}</div>
              <div className="text-white/90 font-medium">완료한 레슨</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;