
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useSummary } from '@/hooks/useSummary';
import { useAutoFlashcards } from '@/hooks/useAutoFlashcards';
import { useQuiz } from '@/hooks/useQuiz';
import Header from '@/components/Header';
import AuthGuard from '@/components/AuthGuard';
import FlashcardList from '@/components/FlashcardList';
import ResumoHeader from '@/components/resumo/ResumoHeader';
import ResumoStats from '@/components/resumo/ResumoStats';
import ResumoMainContent from '@/components/resumo/ResumoMainContent';

const Resumo = () => {
  const { id } = useParams(); // Mudança: usar 'id' genérico em vez de 'uploadId'
  const navigate = useNavigate();
  const { getResumo, getResumoById } = useSummary();
  const { generateAutoFlashcards, isGenerating } = useAutoFlashcards();
  const [resumo, setResumo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showFlashcards, setShowFlashcards] = useState(false);
  
  // Hook do quiz
  const { generateQuiz, loading: quizLoading } = useQuiz(resumo?.id || '');

  useEffect(() => {
    if (id) {
      loadResumo();
    }
    // eslint-disable-next-line
  }, [id]);

  const loadResumo = async () => {
    try {
      setLoading(true);
      
      // Primeiro tenta buscar por ID do resumo
      let resumoData = await getResumoById(id!);
      
      // Se não encontrou, tenta buscar por upload ID (compatibilidade)
      if (!resumoData) {
        resumoData = await getResumo(id!);
      }
      
      if (resumoData) {
        setResumo(resumoData);
      } else {
        console.error('Resumo não encontrado com ID:', id);
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
      navigate('/', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleGerarFlashcards = () => {
    setShowFlashcards(true);
  };

  const handleGerarFlashcardsAutomatico = async () => {
    try {
      await generateAutoFlashcards(resumo.id, resumo.resumo_gerado);
    } catch (error) {
      console.error('Erro ao gerar flashcards automáticos:', error);
    }
  };

  const handleGenerateQuiz = async () => {
    try {
      const success = await generateQuiz(resumo.resumo_gerado);
      if (success) {
        navigate(`/quiz/${resumo.id}`);
      }
    } catch (error) {
      console.error('Erro ao gerar quiz:', error);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </main>
      </div>
    );
  }

  const dataFormatada = new Date(resumo.data_criacao).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const estimatedReadTime = Math.ceil(resumo.resumo_gerado.length / 1000);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        
        <main className="container mx-auto px-4 py-8 space-y-8">
          <ResumoHeader onBack={handleBack} />

          <ResumoStats
            estimatedReadTime={estimatedReadTime}
            contentLength={resumo.resumo_gerado.length}
            createdDate={dataFormatada}
          />

          <ResumoMainContent
            content={resumo.resumo_gerado}
            createdDate={dataFormatada}
            onGenerateAutoFlashcards={handleGerarFlashcardsAutomatico}
            onManageFlashcards={handleGerarFlashcards}
            onGenerateQuiz={handleGenerateQuiz}
            isGeneratingFlashcards={isGenerating}
            isGeneratingQuiz={quizLoading}
          />
        </main>

        <FlashcardList resumoId={resumo.id} open={showFlashcards} onClose={() => setShowFlashcards(false)} />
      </div>
    </AuthGuard>
  );
};

export default Resumo;
