export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  passwordHash?: string;
  createdAt: string;
}

export interface Summary {
  shortSummary: string;
  detailedSummary: string;
  keyPoints: string[];
  importantDefinitions: any[];
}

export interface Note {
  id: string;
  userId: string;
  filename: string;
  fileType: string;
  uploadDate: string;
  summary?: Summary;
  base64?: string;
  content?: string;
  isLocked?: boolean;
  pinCode?: string;
}

export interface QuizQuestion {
  question: string;
  options?: string[];
  answer: string;
}

export interface Quiz {
  id: string;
  userId: string;
  title: string;
  notesId?: string;
  notesTitle?: string;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  title?: string;
  quizTitle?: string;
  score: number;
  total: number;
  userAnswers?: string[];
  answers?: string[];
  timestamp?: string;
  takenAt?: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface FlashcardSet {
  id: string;
  userId: string;
  title: string;
  notesId?: string;
  notesTitle?: string;
  cards: Flashcard[];
  createdAt: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  notesId: string;
  notesTitle: string;
  messages: ChatMessage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Activity {
  id: string;
  userId: string;
  type: string;
  title: string;
  details: string;
  timestamp: string;
}

export interface DatabaseSchema {
  users: User[];
  notes: Note[];
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  flashcards: FlashcardSet[];
  chats: ChatSession[];
  activities: Activity[];
}
