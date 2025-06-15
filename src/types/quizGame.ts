
export interface QuizQuestion {
  id: string;
  pergunta: string;
  alternativas: string[];
  correta: number;
  explicacao: string;
}

export interface QuizGameState {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  selectedAnswer: number | null;
  userAnswers: (number | null)[];
  score: number;
  isFinished: boolean;
  showExplanation: boolean;
  timeRemaining: number;
  startTime: number;
}

export interface QuizSessionResult {
  id: string;
  quizTitle: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  completionTime: number;
  bonusXP: number;
  totalXP: number;
  questions: QuizQuestion[];
  userAnswers: (number | null)[];
  performance: {
    wrongAnswers: any[];
    suggestions: string[];
    weakTopics: any[];
  };
  questionsData: any[];
}
