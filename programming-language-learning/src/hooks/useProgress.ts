import { useState, useEffect } from 'react';
import { UserProgress } from '../types';

const DEFAULT_PROGRESS: UserProgress = {
  languageId: '',
  completedLessons: [],
  currentStreak: 0,
  totalXp: 0,
  level: 1,
  lastStudyDate: new Date()
};

export const useProgress = (languageId: string) => {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);

  useEffect(() => {
    const savedProgress = localStorage.getItem(`progress_${languageId}`);
    if (savedProgress) {
      const parsed = JSON.parse(savedProgress);
      setProgress({
        ...parsed,
        lastStudyDate: new Date(parsed.lastStudyDate)
      });
    } else {
      setProgress({
        ...DEFAULT_PROGRESS,
        languageId
      });
    }
  }, [languageId]);

  const completeLesson = (lessonId: string, xpEarned: number) => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        completedLessons: [...prev.completedLessons, lessonId],
        totalXp: prev.totalXp + xpEarned,
        level: Math.floor((prev.totalXp + xpEarned) / 100) + 1,
        currentStreak: calculateStreak(prev.lastStudyDate),
        lastStudyDate: new Date()
      };

      localStorage.setItem(`progress_${languageId}`, JSON.stringify(newProgress));
      return newProgress;
    });
  };

  const calculateStreak = (lastStudyDate: Date): number => {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastStudyDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 1 ? progress.currentStreak + 1 : 1;
  };

  const getTotalStats = () => {
    const allLanguages = ['javascript', 'python', 'typescript', 'react'];
    let totalXp = 0;
    let totalLessons = 0;
    let maxStreak = 0;

    allLanguages.forEach(lang => {
      const saved = localStorage.getItem(`progress_${lang}`);
      if (saved) {
        const data = JSON.parse(saved);
        totalXp += data.totalXp || 0;
        totalLessons += data.completedLessons?.length || 0;
        maxStreak = Math.max(maxStreak, data.currentStreak || 0);
      }
    });

    return { totalXp, totalLessons, maxStreak };
  };

  return {
    progress,
    completeLesson,
    getTotalStats
  };
};