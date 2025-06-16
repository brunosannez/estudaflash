
export const createSummaryPrompt = (extractedText: string, schoolYear?: string) => {
  const educationLevel = getEducationLevel(schoolYear);
  
  return `Você é um professor especialista em educação brasileira, com experiência em preparar alunos para exames como ENEM, vestibulares e avaliações de instituições renomadas como o Colégio Ari de Sá Cavalcante.

CONTEXTO DO ALUNO:
- Nível educacional: ${educationLevel}
- Foco: Preparação para provas brasileiras (ENEM, vestibulares, avaliações escolares)

TEXTO PARA RESUMIR:
${extractedText}

INSTRUÇÕES PARA O RESUMO:

1. **ESTRUTURA OBRIGATÓRIA:**
   - Título principal do tópico
   - Conceitos fundamentais (definições claras)
   - Desenvolvimento detalhado com exemplos
   - Conexões interdisciplinares
   - Aplicações práticas
   - "O que pode cair na prova?"

2. **DIRETRIZES PEDAGÓGICAS:**
   - Use linguagem adequada ao nível ${educationLevel}
   - Inclua exemplos práticos e contextualizados no Brasil
   - Destaque fórmulas, datas e conceitos-chave
   - Conecte o conteúdo com temas transversais (sustentabilidade, cidadania, etc.)
   - Relacione com questões sociais, históricas e geográficas brasileiras quando relevante

3. **FORMATAÇÃO:**
   - Use **negrito** para conceitos importantes
   - Use marcadores (•) para listas
   - Organize em seções claras com títulos
   - Inclua resumos pontuais ao final de cada seção

4. **SEÇÃO ESPECIAL - "O QUE PODE CAIR NA PROVA?":**
   Esta seção deve conter:
   - Tópicos mais cobrados sobre este assunto
   - Tipos de questão comum (múltipla escolha, dissertativa, etc.)
   - Pegadinhas e erros comuns
   - Dicas de resolução
   - Exemplos de como o tema aparece no ENEM
   - Conexões com outras disciplinas
   - Atualidades relacionadas ao tema

5. **ADAPTAÇÃO POR NÍVEL:**
   ${getSpecificGuidelines(educationLevel)}

Crie um resumo completo, didático e estratégico que realmente prepare o aluno para ter sucesso nas avaliações. O aluno deve conseguir responder qualquer pergunta sobre o tema após estudar este resumo.`;
};

export const createQuizPrompt = (summaryContent: string, schoolYear?: string) => {
  const educationLevel = getEducationLevel(schoolYear);
  
  return `Você é um especialista em elaboração de questões para exames brasileiros (ENEM, vestibulares, Colégio Ari de Sá Cavalcante).

CONTEXTO:
- Nível educacional: ${educationLevel}
- Conteúdo base: ${summaryContent}

INSTRUÇÕES PARA CRIAÇÃO DO QUIZ:

1. **CARACTERÍSTICAS DAS QUESTÕES:**
   - Criar 5-8 questões de múltipla escolha
   - Estilo ENEM: contextualizada, interdisciplinar, aplicada
   - 5 alternativas por questão (A, B, C, D, E)
   - Nível de dificuldade adequado ao ${educationLevel}

2. **ESTRUTURA DE CADA QUESTÃO:**
   - Contexto inicial (situação-problema, texto, gráfico conceitual)
   - Comando claro e objetivo
   - 5 alternativas plausíveis
   - Apenas uma correta
   - Explicação detalhada da resposta

3. **DIRETRIZES ESPECÍFICAS:**
   ${getQuizGuidelines(educationLevel)}

4. **PADRÃO DE RESPOSTA:**
   Para cada questão, forneça:
   - Pergunta contextualizada
   - 5 alternativas (A, B, C, D, E)
   - Resposta correta (número de 0-4)
   - Explicação completa (por que está correta + por que as outras estão erradas)

5. **TEMAS TRANSVERSAIS A INCLUIR:**
   - Sustentabilidade e meio ambiente
   - Tecnologia e sociedade
   - Diversidade cultural brasileira
   - Cidadania e democracia
   - Direitos humanos

Elabore questões que realmente testem a compreensão profunda do conteúdo e preparem o aluno para os desafios dos exames brasileiros.

FORMATO JSON ESPERADO:
{
  "perguntas": [
    {
      "pergunta": "texto da pergunta",
      "alternativas": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
      "correta": 0,
      "explicacao": "explicação detalhada"
    }
  ]
}`;
};

const getEducationLevel = (schoolYear?: string): string => {
  if (!schoolYear) return 'Ensino Médio';
  
  if (schoolYear.includes('Fundamental')) return 'Ensino Fundamental';
  if (schoolYear.includes('Médio')) return 'Ensino Médio';
  if (schoolYear.includes('Superior')) return 'Ensino Superior';
  
  return 'Ensino Médio';
};

const getSpecificGuidelines = (level: string): string => {
  switch (level) {
    case 'Ensino Fundamental':
      return `- Use vocabulário acessível, explique termos técnicos
- Inclua mais exemplos concretos do cotidiano
- Foque em conceitos base, evite complexidade excessiva
- Conecte com experiências da faixa etária (10-14 anos)`;
      
    case 'Ensino Superior':
      return `- Use terminologia técnica adequada
- Inclua referências bibliográficas quando relevante
- Aborde aspectos mais complexos e nuances
- Conecte com pesquisas e aplicações profissionais`;
      
    default: // Ensino Médio
      return `- Equilibre linguagem técnica com clareza
- Foque na preparação para ENEM e vestibulares
- Inclua análise crítica e interpretação
- Conecte teoria com aplicação prática`;
  }
};

const getQuizGuidelines = (level: string): string => {
  switch (level) {
    case 'Ensino Fundamental':
      return `- Questões mais diretas, menos abstratas
- Contextos familiares ao dia a dia do aluno
- Vocabulário simples e claro
- Foco em compreensão de conceitos básicos`;
      
    case 'Ensino Superior':
      return `- Questões complexas envolvendo análise e síntese
- Contextos profissionais e acadêmicos
- Integração de múltiplas variáveis
- Foco em aplicação e resolução de problemas`;
      
    default: // Ensino Médio
      return `- Questões no estilo ENEM: contextualizadas e interdisciplinares
- Situações-problema do mundo real
- Análise de gráficos, textos e dados
- Foco em competências e habilidades do ENEM`;
  }
};
