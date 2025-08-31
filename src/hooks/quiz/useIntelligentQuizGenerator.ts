import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContentAnalysis {
  wordCount: number;
  theme: string;
  difficulty: 'easy' | 'medium' | 'hard';
  suggestedQuestions: {
    multipleChoice: number;
    trueFalse: number;
    total: number;
  };
}

interface QuizQuestion {
  id: string;
  question_type: 'multiple_choice' | 'true_false';
  pergunta: string;
  alternativas?: string[];
  correta?: number;
  true_false_statements?: string[];
  correct_statements?: boolean[];
  explicacao: string;
}

export const useIntelligentQuizGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Intelligent content analysis
  const analyzeContent = useCallback((content: string): ContentAnalysis => {
    const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    // Theme detection based on keywords
    const themes = {
      'História': ['história', 'guerra', 'revolução', 'século', 'brasil', 'império', 'república'],
      'Matemática': ['matemática', 'equação', 'função', 'número', 'cálculo', 'geometria'],
      'Física': ['física', 'força', 'energia', 'movimento', 'velocidade', 'massa'],
      'Química': ['química', 'elemento', 'reação', 'molécula', 'átomo', 'tabela'],
      'Biologia': ['biologia', 'célula', 'dna', 'evolução', 'ecossistema', 'genética'],
      'Geografia': ['geografia', 'clima', 'relevo', 'população', 'território', 'região'],
      'Literatura': ['literatura', 'poesia', 'romance', 'autor', 'obra', 'estilo'],
      'Português': ['português', 'gramática', 'sintaxe', 'morfologia', 'semântica', 'texto']
    };

    const contentLower = content.toLowerCase();
    let maxScore = 0;
    let detectedTheme = 'Geral';

    Object.entries(themes).forEach(([theme, keywords]) => {
      const score = keywords.reduce((count, keyword) => {
        return count + (contentLower.includes(keyword) ? 1 : 0);
      }, 0);
      
      if (score > maxScore) {
        maxScore = score;
        detectedTheme = theme;
      }
    });

    // Intelligent question quantity calculation
    let suggestedQuestions;
    if (wordCount <= 300) {
      // Short content: 4-6 questions (70% MC, 30% TF)
      suggestedQuestions = {
        multipleChoice: 4,
        trueFalse: 2,
        total: 6
      };
    } else if (wordCount <= 600) {
      // Medium content: 6-8 questions
      suggestedQuestions = {
        multipleChoice: 5,
        trueFalse: 3,
        total: 8
      };
    } else if (wordCount <= 900) {
      // Long content: 8-10 questions
      suggestedQuestions = {
        multipleChoice: 6,
        trueFalse: 4,
        total: 10
      };
    } else {
      // Very long content: 10-12 questions
      suggestedQuestions = {
        multipleChoice: 8,
        trueFalse: 4,
        total: 12
      };
    }

    // Difficulty based on content complexity
    const difficulty = wordCount > 600 ? 'hard' : wordCount > 300 ? 'medium' : 'easy';

    return {
      wordCount,
      theme: detectedTheme,
      difficulty,
      suggestedQuestions
    };
  }, []);

  // Check if quiz exists and is valid
  const checkExistingQuiz = useCallback(async (resumoId: string) => {
    const { data: existingQuestions, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('resumo_id', resumoId)
      .not('pergunta', 'is', null);

    if (error) {
      console.error('Error checking existing quiz:', error);
      return { exists: false, questions: [] };
    }

    // Validate existing questions
    const validQuestions = existingQuestions?.filter(q => {
      if (q.question_type === 'multiple_choice' || q.question_type === 'objetiva') {
        return Array.isArray(q.alternativas) && 
               q.alternativas.length === 5 && 
               typeof q.correta === 'number' && 
               q.correta >= 0 && 
               q.correta <= 4;
      } else if (q.question_type === 'true_false') {
        return Array.isArray(q.true_false_statements) && 
               Array.isArray(q.correct_statements) && 
               q.true_false_statements.length === q.correct_statements.length;
      }
      return false;
    }) || [];

    return {
      exists: validQuestions.length >= 4, // Minimum 4 questions to be considered valid
      questions: validQuestions
    };
  }, []);

  // Generate intelligent quiz
  const generateIntelligentQuiz = useCallback(async (resumoContent: string, resumoId: string, userId?: string) => {
    if (!resumoContent || resumoContent.trim().length < 50) {
      throw new Error('Conteúdo insuficiente para gerar quiz');
    }

    setLoading(true);
    setAnalyzing(true);

    try {
      // Step 1: Analyze content
      console.log('🔍 Analyzing content for intelligent quiz generation...');
      const analysis = analyzeContent(resumoContent);
      
      console.log('📊 Content Analysis:', analysis);
      toast.success(`Detectado: ${analysis.theme} (${analysis.wordCount} palavras)`);

      setAnalyzing(false);
      setGenerating(true);

      // Step 2: Check for existing quiz
      const { exists, questions: existingQuestions } = await checkExistingQuiz(resumoId);
      
      if (exists) {
        console.log('✅ Valid quiz already exists');
        toast.info('Quiz existente encontrado!');
        return existingQuestions;
      }

      // Step 3: Generate new quiz with intelligent parameters
      console.log('🚀 Generating new intelligent quiz...');
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: { 
          resumoContent,
          resumoId,
          userId,
          analysis: {
            theme: analysis.theme,
            difficulty: analysis.difficulty,
            multipleChoiceCount: analysis.suggestedQuestions.multipleChoice,
            trueFalseCount: analysis.suggestedQuestions.trueFalse
          }
        }
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        throw new Error(error.message || 'Erro ao gerar quiz');
      }

      if (!data.success) {
        console.error('❌ Quiz generation failed:', data.error);
        throw new Error(data.error || 'Falha na geração do quiz');
      }

      console.log('✅ Intelligent quiz generated successfully:', data);
      toast.success(`Quiz gerado: ${data.questoes.length} questões (${analysis.theme})`);
      
      return data.questoes;

    } catch (error) {
      console.error('❌ Quiz generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar quiz');
      throw error;
    } finally {
      setLoading(false);
      setAnalyzing(false);
      setGenerating(false);
    }
  }, [analyzeContent, checkExistingQuiz]);

  return {
    loading,
    analyzing,
    generating,
    analyzeContent,
    checkExistingQuiz,
    generateIntelligentQuiz
  };
};