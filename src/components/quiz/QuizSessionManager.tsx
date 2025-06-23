
import React from 'react';
import { useQuizSession } from '@/hooks/useQuizSession';

interface QuizSessionManagerProps {
  quiz: {
    resumo_id: string;
    questoes: any[];
    titulo?: string;
  };
  onSessionStart: (sessionData: any) => void;
  onSessionComplete: (result: any) => void;
  children: (sessionMethods: {
    addResponse: (response: any) => void;
    completeSession: () => Promise<any>;
  }) => React.ReactNode;
}

const QuizSessionManager = ({ 
  quiz, 
  onSessionStart, 
  onSessionComplete, 
  children 
}: QuizSessionManagerProps) => {
  const { startSession, addResponse, completeSession } = useQuizSession();
  const [sessionStarted, setSessionStarted] = React.useState(false);

  // Initialize session when component loads
  React.useEffect(() => {
    if (!sessionStarted && quiz.questoes.length > 0) {
      console.log('🚀 Starting quiz session');
      const resumoContent = quiz.titulo || `Quiz com ${quiz.questoes.length} questões`;
      startSession(quiz.resumo_id, resumoContent, quiz.questoes);
      setSessionStarted(true);
      onSessionStart({ sessionStarted: true });
    }
  }, [quiz, sessionStarted, startSession, onSessionStart]);

  const handleCompleteSession = async () => {
    const result = await completeSession();
    if (result) {
      onSessionComplete(result);
    }
    return result;
  };

  return (
    <>
      {children({
        addResponse,
        completeSession: handleCompleteSession
      })}
    </>
  );
};

export default QuizSessionManager;
