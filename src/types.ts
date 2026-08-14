export type TestMode = 'words' | 'sentence' | 'paragraph' | 'time_challenge' | 'custom';

export type TimerPreset = 15 | 30 | 60 | 120 | 300 | 'custom';

export type TestState = 'idle' | 'running' | 'completed';

export type CharState = 'untouched' | 'correct' | 'incorrect' | 'skipped';

export interface CustomText {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface TestResult {
  id: string;
  wpm: number;
  cpm: number;
  accuracy: number;
  totalMistakes: number;
  correctChars: number;
  wrongChars: number;
  duration: number; // in seconds
  mode: TestMode;
  date: string;
  passageSnippet: string;
}

export interface CharStats {
  char: string;
  correct: number;
  incorrect: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinedDate: string;
  isLoggedIn: boolean;
  bestWpm?: number;
  testsCompleted?: number;
}
