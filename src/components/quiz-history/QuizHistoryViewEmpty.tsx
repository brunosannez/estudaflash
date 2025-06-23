
import PageLayout from '@/components/navigation/PageLayout';

const QuizHistoryViewEmpty = () => {
  return (
    <PageLayout>
      <div className="text-center py-20">
        <p className="text-lg text-gray-600">Quiz não encontrado</p>
      </div>
    </PageLayout>
  );
};

export default QuizHistoryViewEmpty;
