
import PageLayout from '@/components/navigation/PageLayout';

const QuizHistoryViewLoading = () => {
  return (
    <PageLayout>
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Carregando dados do quiz...</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default QuizHistoryViewLoading;
