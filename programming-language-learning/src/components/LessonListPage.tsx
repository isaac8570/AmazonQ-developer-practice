import React from 'react';
import { Language, Lesson } from '../types';
import { lessons } from '../data/lessons';

interface LessonListPageProps {
  selectedLanguage: Language;
  onLessonSelect: (lesson: Lesson) => void;
  onBackToHome: () => void;
}

const LessonListPage: React.FC<LessonListPageProps> = ({
  selectedLanguage,
  onLessonSelect,
  onBackToHome
}) => {
  const languageLessons = lessons.filter(lesson => lesson.languageId === selectedLanguage.id);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-400/20 text-green-200 border-green-400/30';
      case 'intermediate': return 'bg-yellow-400/20 text-yellow-200 border-yellow-400/30';
      case 'advanced': return 'bg-red-400/20 text-red-200 border-red-400/30';
      default: return 'bg-gray-400/20 text-gray-200 border-gray-400/30';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '초급';
      case 'intermediate': return '중급';
      case 'advanced': return '고급';
      default: return difficulty;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden p-6">
      {/* 몽환적 배경 */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
      
      {/* 떠다니는 원형 배경 요소들 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex items-center mb-8">
          <button
            onClick={onBackToHome}
            className="mr-4 p-3 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all shadow-lg"
          >
            ← 돌아가기
          </button>
          <div className="backdrop-blur-md bg-white/10 rounded-3xl p-6 shadow-2xl border border-white/20 flex-1">
            <div className="flex items-center">
              <div 
                className="text-5xl mr-4 p-3 rounded-2xl backdrop-blur-sm shadow-lg"
                style={{ backgroundColor: `${selectedLanguage.color}20` }}
              >
                {selectedLanguage.icon}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                  {selectedLanguage.name}
                </h1>
                <p className="text-white/80 drop-shadow-md">{selectedLanguage.description}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {languageLessons.map((lesson, index) => (
            <div
              key={lesson.id}
              className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 shadow-2xl border border-white/20 cursor-pointer transform hover:scale-105 hover:bg-white/15 transition-all duration-300 group"
              onClick={() => onLessonSelect(lesson)}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-4 p-3 rounded-2xl backdrop-blur-sm bg-white/10 shadow-lg">
                    📚
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white drop-shadow-md mb-1">
                      레슨 {index + 1}
                    </h3>
                    <h4 className="text-sm text-white/80 drop-shadow-sm">
                      {lesson.title}
                    </h4>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <span className="text-white text-xl">▶</span>
                  </div>
                </div>
                
                <p className="text-white/80 text-sm mb-4 flex-1 drop-shadow-sm">
                  {lesson.description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getDifficultyColor(lesson.difficulty)}`}>
                    {getDifficultyText(lesson.difficulty)}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs text-cyan-200 bg-cyan-400/20 border border-cyan-400/30 backdrop-blur-sm">
                    💎 {lesson.xpReward} XP
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs text-purple-200 bg-purple-400/20 border border-purple-400/30 backdrop-blur-sm">
                    ❓ {lesson.questions.length}문제
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {languageLessons.length === 0 && (
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-12 shadow-2xl border border-white/20 text-center">
            <div className="text-8xl mb-6">🚧</div>
            <h3 className="text-2xl font-semibold text-white mb-4 drop-shadow-lg">
              준비 중입니다
            </h3>
            <p className="text-white/80 text-lg drop-shadow-md">
              {selectedLanguage.name} 레슨이 곧 추가될 예정입니다!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonListPage;