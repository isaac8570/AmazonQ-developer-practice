import React, { useState } from 'react';
import { Lesson, QuizState } from '../types';

interface QuizPageProps {
  lesson: Lesson;
  onComplete: (score: number, totalXp: number) => void;
  onBackToLessons: () => void;
}

const QuizPage: React.FC<QuizPageProps> = ({ lesson, onComplete, onBackToLessons }) => {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: [],
    score: 0,
    isComplete: false,
    startTime: new Date()
  });

  const [selectedAnswer, setSelectedAnswer] = useState<string | number>('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentQuestion = lesson.questions[quizState.currentQuestionIndex];
  const progress = ((quizState.currentQuestionIndex + 1) / lesson.questions.length) * 100;

  const handleAnswerSubmit = () => {
    if (selectedAnswer === '') return;

    const correct = selectedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    const newScore = correct ? quizState.score + currentQuestion.points : quizState.score;
    const newAnswers = [...quizState.answers, selectedAnswer];

    setQuizState(prev => ({
      ...prev,
      answers: newAnswers,
      score: newScore
    }));
  };

  const handleNextQuestion = () => {
    const nextIndex = quizState.currentQuestionIndex + 1;
    
    if (nextIndex >= lesson.questions.length) {
      const finalScore = quizState.score + (isCorrect ? currentQuestion.points : 0);
      const earnedXp = Math.floor((finalScore / getTotalPossibleScore()) * lesson.xpReward);
      
      setQuizState(prev => ({
        ...prev,
        isComplete: true
      }));
      
      onComplete(finalScore, earnedXp);
    } else {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: nextIndex
      }));
      setSelectedAnswer('');
      setShowResult(false);
    }
  };

  const getTotalPossibleScore = () => {
    return lesson.questions.reduce((total, q) => total + q.points, 0);
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option, index) => (
              <button
                key={index}
                className={`w-full p-4 text-left rounded-2xl border transition-all transform hover:scale-105 ${
                  selectedAnswer === index
                    ? 'border-blue-400 bg-blue-400/20 text-white backdrop-blur-sm shadow-lg'
                    : 'border-white/30 bg-white/10 text-white/90 hover:bg-white/20 backdrop-blur-sm'
                }`}
                onClick={() => setSelectedAnswer(index)}
                disabled={showResult}
              >
                {option}
              </button>
            ))}
          </div>
        );

      case 'fill-blank':
      case 'code-completion':
        return (
          <div>
            {currentQuestion.code && (
              <pre className="bg-black/30 backdrop-blur-sm p-4 rounded-2xl mb-4 overflow-x-auto border border-white/20 shadow-lg">
                <code className="text-green-300">{currentQuestion.code}</code>
              </pre>
            )}
            <input
              type="text"
              className="w-full p-4 border border-white/30 bg-white/10 backdrop-blur-sm rounded-2xl text-white placeholder-white/60 focus:border-blue-400 focus:bg-white/20 outline-none transition-all shadow-lg"
              placeholder="답을 입력하세요..."
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              disabled={showResult}
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (quizState.isComplete) {
    const finalScore = quizState.score;
    const scorePercentage = (finalScore / getTotalPossibleScore()) * 100;
    const earnedXp = Math.floor(scorePercentage / 100 * lesson.xpReward);

    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6">
        {/* 몽환적 배경 */}
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
        
        {/* 떠다니는 원형 배경 요소들 */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8 max-w-md w-full text-center relative z-10">
          <div className="text-8xl mb-6 animate-bounce">
            {scorePercentage >= 80 ? '🎉' : scorePercentage >= 60 ? '👏' : '💪'}
          </div>
          <h2 className="text-3xl font-bold text-white mb-6 drop-shadow-lg">
            레슨 완료!
          </h2>
          <div className="space-y-4 mb-8">
            <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-4 border border-white/10">
              <div className="flex justify-between">
                <span className="text-white/80">점수:</span>
                <span className="font-semibold text-white">{finalScore}/{getTotalPossibleScore()}</span>
              </div>
            </div>
            <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-4 border border-white/10">
              <div className="flex justify-between">
                <span className="text-white/80">정답률:</span>
                <span className="font-semibold text-white">{Math.round(scorePercentage)}%</span>
              </div>
            </div>
            <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-4 border border-white/10">
              <div className="flex justify-between">
                <span className="text-white/80">획득 XP:</span>
                <span className="font-semibold text-cyan-400">💎 {earnedXp}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onBackToLessons}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all font-semibold shadow-lg transform hover:scale-105"
          >
            레슨 목록으로
          </button>
        </div>
      </div>
    );
  }

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

      <div className="max-w-4xl mx-auto relative z-10">
        <header className="mb-8">
          <div className="backdrop-blur-md bg-white/10 rounded-3xl p-6 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onBackToLessons}
                className="p-3 rounded-2xl backdrop-blur-sm bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all shadow-lg"
              >
                ← 돌아가기
              </button>
              <span className="text-white/80 font-medium">
                {quizState.currentQuestionIndex + 1}/{lesson.questions.length}
              </span>
            </div>
            
            <div className="w-full bg-white/20 rounded-full h-4 mb-4 backdrop-blur-sm">
              <div
                className="h-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">{lesson.title}</h1>
          </div>
        </header>

        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-blue-400/20 text-blue-200 border border-blue-400/30 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
              {currentQuestion.type === 'multiple-choice' && '객관식'}
              {currentQuestion.type === 'fill-blank' && '빈칸 채우기'}
              {currentQuestion.type === 'code-completion' && '코드 완성'}
              {currentQuestion.type === 'debug' && '디버깅'}
            </span>
            <h2 className="text-xl font-semibold text-white mb-4 drop-shadow-md">
              {currentQuestion.question}
            </h2>
          </div>

          {renderQuestion()}

          {showResult && (
            <div className={`mt-6 p-4 rounded-2xl backdrop-blur-sm border shadow-lg ${
              isCorrect 
                ? 'bg-green-400/20 border-green-400/30 text-green-200' 
                : 'bg-red-400/20 border-red-400/30 text-red-200'
            }`}>
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{isCorrect ? '✅' : '❌'}</span>
                <span className="font-semibold">
                  {isCorrect ? '정답입니다!' : '틀렸습니다.'}
                </span>
              </div>
              <p className="text-white/90">{currentQuestion.explanation}</p>
              {!isCorrect && (
                <p className="mt-2 text-sm text-white/70">
                  정답: {currentQuestion.correctAnswer}
                </p>
              )}
            </div>
          )}

          <div className="mt-8 flex justify-end">
            {!showResult ? (
              <button
                onClick={handleAnswerSubmit}
                disabled={selectedAnswer === ''}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-8 rounded-2xl hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all font-semibold shadow-lg transform hover:scale-105 backdrop-blur-sm border border-white/20"
              >
                확인
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-4 px-8 rounded-2xl hover:from-green-600 hover:to-blue-700 transition-all font-semibold shadow-lg transform hover:scale-105 backdrop-blur-sm border border-white/20"
              >
                {quizState.currentQuestionIndex + 1 >= lesson.questions.length ? '완료' : '다음'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;