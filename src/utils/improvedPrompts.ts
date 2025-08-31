
// Sistema inteligente de detecção de conteúdo e adaptação de prompts
const detectContentType = (text: string) => {
  const lowerText = text.toLowerCase();
  
  // Detectar disciplina
  let discipline = 'geral';
  if (lowerText.match(/(história|histórico|século|guerra|revolução|império|república|colonização)/)) discipline = 'história';
  else if (lowerText.match(/(geografia|clima|relevo|população|território|região|estado|país)/)) discipline = 'geografia';
  else if (lowerText.match(/(biologia|célula|dna|proteína|genética|evolução|ecossistema|organismo)/)) discipline = 'biologia';
  else if (lowerText.match(/(química|átomo|molécula|reação|elemento|composto|solução)/)) discipline = 'química';
  else if (lowerText.match(/(física|força|energia|movimento|velocidade|aceleração|onda|luz)/)) discipline = 'física';
  else if (lowerText.match(/(matemática|equação|função|gráfico|área|volume|estatística|probabilidade)/)) discipline = 'matemática';
  else if (lowerText.match(/(literatura|linguagem|texto|poesia|romance|autor|obra|estilo)/)) discipline = 'português';
  else if (lowerText.match(/(filosofia|ética|conhecimento|verdade|ser|existência|pensamento)/)) discipline = 'filosofia';
  else if (lowerText.match(/(sociologia|sociedade|cultura|grupo|instituição|mudança social)/)) discipline = 'sociologia';
  
  // Detectar tipo de material
  let materialType = 'livro';
  if (lowerText.match(/(exercício|questão|problema|resolva|calcule|determine)/)) materialType = 'exercícios';
  else if (lowerText.match(/(slide|apresentação|tópico|bullet)/)) materialType = 'slides';
  else if (lowerText.match(/(resumo|síntese|esquema)/)) materialType = 'resumo';
  
  // Detectar complexidade
  let complexity = 'médio';
  const complexWords = (lowerText.match(/\b\w{7,}\b/g) || []).length;
  const totalWords = (lowerText.match(/\b\w+\b/g) || []).length;
  const complexityRatio = complexWords / totalWords;
  
  if (complexityRatio > 0.3) complexity = 'avançado';
  else if (complexityRatio < 0.15) complexity = 'básico';
  
  return { discipline, materialType, complexity };
};

export const createSummaryPrompt = (extractedText: string, schoolYear?: string) => {
  const educationLevel = getEducationLevel(schoolYear);
  const { discipline, materialType, complexity } = detectContentType(extractedText);
  
  // Determinar idade do usuário baseada no nível escolar
  const getUserAge = (level: string) => {
    switch (level) {
      case 'Ensino Fundamental': return '12-14';
      case 'Ensino Superior': return '18+';
      default: return '15-17';
    }
  };
  
  const userAge = getUserAge(educationLevel);
  
  return `=== INSTRUÇÕES ===

Você é um professor didático e paciente. Sua missão é transformar conteúdos escolares brutos (extraídos de imagem, PDF ou arquivo de estudo) em **resumos claros, completos e explicativos**.

📊 **ANÁLISE DO CONTEÚDO:**
- Nível: ${educationLevel}
- Idade do usuário: ${userAge} anos
- Disciplina detectada: ${discipline.toUpperCase()}
- Tipo de material: ${materialType}
- Complexidade: ${complexity}

**INSTRUÇÕES DETALHADAS:**

1. **Compreensão do texto**  
   - Leia atentamente o conteúdo fornecido abaixo (extraído por OCR).  
   - Identifique os principais tópicos e ideias centrais.  

2. **Método SQ3R**  
   - SURVEY: observe títulos, subtítulos ou trechos-chave.  
   - QUESTION: transforme-os em perguntas que guiem o entendimento.  
   - READ: encontre as respostas no texto.  
   - RECITE: reescreva com suas próprias palavras.  
   - REVIEW: revise para manter clareza e lógica.  

3. **Técnica de Feynman**  
   - Explique como se estivesse ensinando a uma criança.  
   - Simplifique termos difíceis.  
   - Se necessário, use comparações ou exemplos fáceis de entender.  

4. **Formato do resumo**  
   - Crie um **texto corrido**, em parágrafos bem organizados, como um capítulo de livro resumo.  
   - NÃO use listas ou tópicos isolados.  
   - As ideias devem se conectar de forma lógica, com começo, meio e fim.  

5. **Linguagem**  
   - Adapte a explicação para a idade aproximada do estudante: **${userAge} anos**.  
   - Use frases curtas, claras e simples, mas mantendo todas as informações importantes.  
   - O aluno deve ser capaz de entender todo o conteúdo apenas lendo o resumo.  

6. **Completude**  
   - O resumo deve cobrir todas as informações necessárias do texto original.  
   - NÃO invente informações externas. Use somente o material fornecido.  

=== CONTEÚDO A RESUMIR ===
"""
${extractedText}
"""

=== SAÍDA ESPERADA ===
Um **resumo corrido, explicativo e bem estruturado**, semelhante a um texto de livro didático.  
O texto deve:  
- Conter todas as informações essenciais.  
- Ser organizado em parágrafos.  
- Ter clareza e didática, adequado para a idade de ${userAge} anos.`;
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

// Estrutura adaptativa baseada na disciplina detectada
const getAdaptiveStructure = (discipline: string, level: string): string => {
  const structures = {
    história: `
• **CRONOLOGIA & CONTEXTO** - Linha do tempo e causas
• **PERSONAGENS & EVENTOS** - Quem fez o quê e quando
• **CONSEQUÊNCIAS** - Impactos de curto e longo prazo
• **ENEM HISTORY** - Como história aparece contextualizada
• **BRASIL CONEXÃO** - Links com formação nacional`,
    
    geografia: `
• **CONCEITOS ESPACIAIS** - Localização e características
• **PROCESSOS NATURAIS/HUMANOS** - Dinâmicas do espaço
• **DADOS & ESTATÍSTICAS** - Números que caem em prova
• **BRASIL GEOGRÁFICO** - Realidade nacional específica
• **QUESTÕES AMBIENTAIS** - Sustentabilidade e problemas atuais`,
    
    biologia: `
• **ESTRUTURA & FUNÇÃO** - Como funciona biologicamente
• **PROCESSOS VITAIS** - Mecanismos da vida
• **CLASSIFICAÇÃO** - Taxonomia e organização
• **EVOLUÇÃO & GENÉTICA** - Hereditariedade e mudanças
• **ECOLOGIA** - Interações e meio ambiente`,
    
    química: `
• **PROPRIEDADES** - Características físico-químicas
• **REAÇÕES** - Transformações e equações
• **CÁLCULOS** - Fórmulas e estequiometria
• **APLICAÇÕES** - Química no cotidiano e indústria
• **SEGURANÇA** - Riscos e precauções`,
    
    física: `
• **CONCEITOS & LEIS** - Princípios fundamentais
• **FÓRMULAS & CÁLCULOS** - Equações essenciais
• **APLICAÇÕES** - Física no dia a dia
• **GRÁFICOS** - Interpretação de dados
• **TECNOLOGIA** - Inovações e descobertas`,
    
    default: `
• **FUNDAMENTOS** - Base teórica sólida
• **APLICAÇÕES** - Uso prático do conhecimento
• **INTERDISCIPLINARIDADE** - Conexões entre áreas
• **ATUALIDADES** - Contexto contemporâneo
• **COMPETÊNCIAS ENEM** - Habilidades específicas`
  };
  
  return structures[discipline] || structures.default;
};

// Foco específico por disciplina para exames
const getExamFocus = (discipline: string, level: string): string => {
  const examFocus = {
    história: '• Processos históricos brasileiros • Períodos coloniais e republicanos • Movimentos sociais • Ditadura e democracia',
    geografia: '• Geopolítica mundial • Questões ambientais brasileiras • Demografia • Urbanização • Globalização',
    biologia: '• Ecologia e meio ambiente • Genética e biotecnologia • Fisiologia humana • Evolução • Citologia',
    química: '• Química orgânica • Físico-química • Meio ambiente • Cálculos estequiométricos',
    física: '• Mecânica • Termodinâmica • Eletromagnetismo • Ondulatória • Física moderna',
    português: '• Interpretação textual • Literatura brasileira • Gramática aplicada • Redação argumentativa',
    matemática: '• Funções • Geometria • Estatística • Probabilidade • Análise combinatória',
    default: '• Análise crítica • Interpretação • Aplicação prática • Interdisciplinaridade'
  };
  
  return examFocus[discipline] || examFocus.default;
};

const getSpecificGuidelines = (level: string): string => {
  switch (level) {
    case 'Ensino Fundamental':
      return `🎯 **ADAPTAÇÃO FUNDAMENTAL:**
- Linguagem simples e direta
- Exemplos do cotidiano familiar
- Conceitos básicos bem explicados
- Preparação para o ensino médio
- Foco em compreensão, não decoreba`;
      
    case 'Ensino Superior':
      return `🎯 **ADAPTAÇÃO UNIVERSITÁRIA:**
- Terminologia técnica precisa
- Referências acadêmicas quando útil
- Aspectos avançados e nuances
- Aplicações profissionais
- Pesquisa e desenvolvimento crítico`;
      
    default: // Ensino Médio
      return `🎯 **ADAPTAÇÃO PRÉ-VESTIBULAR:**
- Equilibrio entre técnico e acessível
- FOCO TOTAL: ENEM + vestibulares top
- Análise crítica desenvolvida
- Teoria + aplicação prática
- Estratégias de resolução rápida
- Mindset de aprovação`;
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
