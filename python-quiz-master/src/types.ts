export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface Question {
  id: number;
  question: string;
  options: {
    [key: string]: string;
  };
  correctAnswer: string;
  difficulty: Difficulty;
  hint?: string;
  explanation: string;
}

export interface LeaderboardEntry {
  id?: string;
  uid: string;
  displayName: string;
  score: number;
  difficulty: Difficulty;
  createdAt: any;
}

export interface QuizState {
  difficulty: Difficulty | null;
  currentQuestionIndex: number;
  score: number;
  correctCount: number;
  incorrectCount: number;
  currentStreak: number;
  maxStreak: number;
  isFinished: boolean;
  userAnswers: string[];
  startTime: number | null;
}
