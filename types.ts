// FIX: Replaced placeholder content with the application's type definitions.
export enum AppState {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  DASHBOARD = 'DASHBOARD',
  CREATING = 'CREATING',
  TAKING_QUIZ = 'TAKING_QUIZ',
  VIEWING_RESULTS = 'VIEWING_RESULTS'
}

export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
}

export interface Question {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface Quiz {
  id: string;
  topic: string;
  title: string;
  description?: string; // Added field for quiz summary
  difficulty: Difficulty;
  createdAt: string;
  questions: Question[];
  lastScore?: number;
  timeLimitMinutes?: number;
}

export interface UserAnswer {
  questionIndex: number;
  selectedOption: number | null;
}

export interface User {
  email: string;
}

export interface QuizDraft {
  inputType: 'topic' | 'file';
  topic: string;
  customTitle: string;
  additionalContext: string;
  fileName: string;
  fileContent: string;
  numQuestions: number;
  difficulty: Difficulty;
  timeLimit: number;
}