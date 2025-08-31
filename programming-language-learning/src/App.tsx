import React, { useState } from 'react';
import './App.css';
import HomePage from './components/HomePage';
import LessonListPage from './components/LessonListPage';
import QuizPage from './components/QuizPage';
import { Language, Lesson } from './types';
import { useProgress } from './hooks/useProgress';

type AppState = 'home' | 'lessons' | 'quiz';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('home');
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const { completeLesson } = useProgress(selectedLanguage?.id || '');

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
    setCurrentState('lessons');
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setCurrentState('quiz');
  };

  const handleQuizComplete = (score: number, totalXp: number) => {
    console.log(`Quiz completed! Score: ${score}, XP earned: ${totalXp}`);
    if (selectedLesson) {
      completeLesson(selectedLesson.id, totalXp);
    }
    setTimeout(() => {
      setCurrentState('lessons');
    }, 2000);
  };

  const handleBackToHome = () => {
    setCurrentState('home');
    setSelectedLanguage(null);
  };

  const handleBackToLessons = () => {
    setCurrentState('lessons');
    setSelectedLesson(null);
  };

  return (
    <div className="App">
      {currentState === 'home' && (
        <HomePage onLanguageSelect={handleLanguageSelect} />
      )}
      
      {currentState === 'lessons' && selectedLanguage && (
        <LessonListPage
          selectedLanguage={selectedLanguage}
          onLessonSelect={handleLessonSelect}
          onBackToHome={handleBackToHome}
        />
      )}
      
      {currentState === 'quiz' && selectedLesson && (
        <QuizPage
          lesson={selectedLesson}
          onComplete={handleQuizComplete}
          onBackToLessons={handleBackToLessons}
        />
      )}
    </div>
  );
}

export default App;
