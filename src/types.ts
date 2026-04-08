export type ContentType = "audio" | "pdf" | "url" | "text" | "podcast";
export type ContentStatus = "completed" | "inProgress" | "notStarted";
export type PageId =
  | "dashboard"
  | "library"
  | "content"
  | "quiz"
  | "results"
  | "reporting"
  | "myEducation"
  | "completedDetail"
  | "profile"
  | "upload";

export interface CategoryPoints {
  name: string;
  pts: number;
}

export interface CpdCategory {
  id: string;
  label: string;
  shortLabel: string;
  earned: number;
  target: number;
  color: string;
}

export interface SubCategory {
  id: string;
  label: string;
  earned: number | null;
}

export interface CompletedEducationItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  provider: string;
  type: ContentType;
  duration: number;
  cpdPoints: number;
  completedDate: string;
  status: "completed";
  categories: CategoryPoints[];
  subAreas?: CategoryPoints[];
  isImported: boolean;
}

export interface ContentItem {
  id: string;
  title: string;
  provider: string;
  type: ContentType;
  duration: number;
  cpdPoints: number;
  categories: CategoryPoints[];
  subAreas?: CategoryPoints[];
  description: string;
  thumbnailColor: string;
  quizId: string | null;
  status: ContentStatus;
  completed: boolean;
  completedDate: string | null;
}

export interface User {
  name: string;
  email: string;
  role: string;
  licenseName?: string;
  licenseNumber: string;
}

export interface QuizAnswer {
  questionId: string;
  selected: number;
  correct: number;
}

export interface QuizResult {
  answers: QuizAnswer[];
  score: number;
  total: number;
  passed: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}
