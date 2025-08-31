export interface Language {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface Lesson {
  id: string;
  languageId: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questions: Question[];
  xpReward: number;
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'code-completion' | 'fill-blank' | 'debug';
  question: string;
  code?: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  points: number;
}

export interface UserProgress {
  languageId: string;
  completedLessons: string[];
  currentStreak: number;
  totalXp: number;
  level: number;
  lastStudyDate: Date;
}

export interface QuizState {
  currentQuestionIndex: number;
  answers: (string | number)[];
  score: number;
  isComplete: boolean;
  startTime: Date;
}