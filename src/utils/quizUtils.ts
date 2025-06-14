
export const generateQuizTitle = (resumoContent: string): string => {
  // Remove quebras de linha e espaços extras
  const cleanContent = resumoContent.replace(/\n+/g, ' ').trim();
  
  // Palavras-chave comuns para identificar tópicos
  const keywordPatterns = [
    /(?:capítulo|chapter)\s+(\d+)/i,
    /(?:aula|lesson)\s+(\d+)/i,
    /(?:tópico|topic)\s*:?\s*([^.\n]{1,50})/i,
    /(?:sobre|about)\s+([^.\n]{1,50})/i,
    /(?:estudo|study)\s+(?:de|of)\s+([^.\n]{1,50})/i
  ];
  
  // Tenta encontrar um padrão conhecido
  for (const pattern of keywordPatterns) {
    const match = cleanContent.match(pattern);
    if (match && match[1]) {
      return `Quiz: ${match[1].trim()}`;
    }
  }
  
  // Se não encontrou padrão, pega as primeiras palavras significativas
  const words = cleanContent
    .split(/\s+/)
    .filter(word => 
      word.length > 3 && 
      !/^(the|and|or|but|in|on|at|to|for|of|with|by)$/i.test(word)
    )
    .slice(0, 4)
    .join(' ');
  
  if (words.length > 0) {
    return `Quiz: ${words}`;
  }
  
  // Fallback
  return `Quiz do Resumo`;
};

export const calculateCompletionTime = (startTime: number): number => {
  return Math.round((Date.now() - startTime) / 1000);
};

export const analyzePerformance = (questoes: any[], respostas: any[]) => {
  const wrongAnswers = respostas
    .map((resp, index) => ({
      pergunta: questoes[index]?.pergunta || '',
      resposta_correta: questoes[index]?.resposta_correta || 0,
      alternativa_correta: questoes[index]?.alternativas?.[questoes[index]?.resposta_correta] || '',
      acertou: resp.acertou
    }))
    .filter(item => !item.acertou);

  const suggestions = wrongAnswers.length > 0 
    ? [
        "Revise os conceitos das questões que errou",
        "Pratique mais exercícios sobre os tópicos principais",
        "Leia novamente o resumo com atenção aos detalhes"
      ]
    : [
        "Excelente desempenho! Continue estudando",
        "Você domina bem este conteúdo",
        "Tente quizzes de outros resumos para expandir conhecimento"
      ];

  return {
    wrongAnswers,
    suggestions,
    weakTopics: wrongAnswers.slice(0, 3) // Primeiros 3 erros como tópicos fracos
  };
};
