
// Sistema de design unificado para o app - Paleta Moderna e Acessível
// Cores principais: Cyan (estudo), Violet (ação), Emerald (sucesso)

export const designColors = {
  gradients: {
    primary: 'from-sky-50 via-violet-50 to-emerald-50',
    secondary: 'from-cyan-50 via-sky-50 to-violet-50',
    accent: 'from-violet-100 via-purple-50 to-sky-50',
    warm: 'from-amber-50 via-orange-50 to-rose-50',
    cool: 'from-cyan-50 via-teal-50 to-emerald-50',
    hero: 'from-sky-100 via-violet-100 to-emerald-100'
  },
  cards: {
    primary: 'bg-white/95 backdrop-blur-sm shadow-lg border border-sky-200/50 rounded-2xl',
    secondary: 'bg-gradient-to-br from-white to-sky-50/50 backdrop-blur-sm shadow-md border border-cyan-100 rounded-xl',
    accent: 'bg-gradient-to-br from-violet-50 to-sky-50 border border-violet-200/50 rounded-2xl',
    interactive: 'bg-white hover:bg-gradient-to-br hover:from-sky-50 hover:to-violet-50 transition-all duration-300 shadow-md hover:shadow-xl border border-transparent hover:border-violet-200/50 rounded-2xl'
  },
  buttons: {
    primary: 'bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white shadow-lg shadow-violet-500/25',
    secondary: 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-lg shadow-cyan-500/25',
    success: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25',
    ghost: 'bg-transparent hover:bg-sky-50 text-gray-700 hover:text-violet-700',
    outline: 'bg-white border-2 border-violet-300 text-violet-700 hover:bg-violet-50'
  },
  backgrounds: {
    main: 'bg-gradient-to-br from-sky-50 via-violet-50/30 to-emerald-50/20',
    card: 'bg-white border border-sky-100',
    header: 'bg-white/95 backdrop-blur-md border-b border-sky-200/50 shadow-sm',
    section: 'bg-gradient-to-br from-white via-sky-50/30 to-violet-50/20'
  },
  text: {
    primary: 'text-gray-800',
    secondary: 'text-gray-600',
    accent: 'text-violet-600',
    muted: 'text-gray-500',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    error: 'text-rose-600'
  },
  borders: {
    light: 'border-sky-100',
    medium: 'border-sky-200',
    accent: 'border-violet-200',
    success: 'border-emerald-200'
  },
  animations: {
    cardHover: 'hover:scale-[1.02] hover:shadow-xl transition-all duration-300 ease-out',
    buttonHover: 'hover:scale-105 active:scale-95 transition-transform duration-200',
    iconFloat: 'hover:animate-bounce',
    slideIn: 'animate-fade-in',
    pulse: 'animate-pulse'
  },
  // Classes responsivas otimizadas para mobile
  responsive: {
    // Títulos principais
    heroTitle: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold',
    pageTitle: 'text-xl sm:text-2xl md:text-3xl font-bold',
    sectionTitle: 'text-lg sm:text-xl md:text-2xl font-semibold',
    cardTitle: 'text-base sm:text-lg md:text-xl font-medium',
    
    // Textos e descrições
    heroText: 'text-base sm:text-lg md:text-xl leading-relaxed',
    bodyText: 'text-sm sm:text-base leading-relaxed',
    captionText: 'text-xs sm:text-sm text-gray-500',
    
    // Ícones
    heroIcon: 'h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12',
    pageIcon: 'h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8',
    cardIcon: 'h-5 w-5 sm:h-6 sm:w-6',
    buttonIcon: 'h-4 w-4 sm:h-5 sm:w-5',
    
    // Espaçamentos
    containerPadding: 'px-4 sm:px-6 md:px-8',
    sectionSpacing: 'space-y-4 sm:space-y-6 md:space-y-8',
    cardPadding: 'p-4 sm:p-5 md:p-6',
    buttonPadding: 'py-2.5 px-4 sm:py-3 sm:px-5 md:py-3.5 md:px-6',
    
    // Layouts de grid
    gridCols1: 'grid-cols-1',
    gridCols2: 'grid-cols-1 sm:grid-cols-2',
    gridCols3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    gridCols4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    
    // Touch targets acessíveis (44x44px mínimo)
    touchTarget: 'min-h-[44px] min-w-[44px]',
    tabButton: 'min-h-[48px] px-4 py-2.5 sm:px-5 sm:py-3'
  },
  // Cores semânticas para gamificação
  gamification: {
    xp: 'text-amber-600 bg-amber-50 border-amber-200',
    streak: 'text-orange-600 bg-orange-50 border-orange-200',
    level: 'text-violet-600 bg-violet-50 border-violet-200',
    badge: 'text-emerald-600 bg-emerald-50 border-emerald-200'
  },
  // Cores para feedback de estudo
  study: {
    correct: 'text-emerald-700 bg-emerald-50 border-emerald-300',
    incorrect: 'text-rose-700 bg-rose-50 border-rose-300',
    neutral: 'text-sky-700 bg-sky-50 border-sky-300',
    warning: 'text-amber-700 bg-amber-50 border-amber-300'
  }
};

// Elementos lúdicos para engajamento
export const playfulElements = {
  emojis: {
    study: ['📚', '📖', '🎓', '✏️', '📝', '💡', '🧠', '⭐'],
    quiz: ['🎯', '🎮', '🏆', '🥇', '🎪', '🎊', '🎉', '✨'],
    flashcard: ['🧠', '💡', '⚡', '🌟', '✨', '🎯', '💪', '🚀'],
    progress: ['🏆', '📈', '🎯', '🌟', '🔥', '💪', '🚀', '⭐'],
    motivation: ['💪', '🚀', '🌈', '✨', '🎉', '👏', '🙌', '💯']
  },
  // Mensagens motivacionais para crianças
  messages: {
    success: [
      'Muito bem! 🎉',
      'Você arrasou! 🌟',
      'Incrível! Continue assim! 💪',
      'Excelente trabalho! ⭐',
      'Você é demais! 🚀'
    ],
    encouragement: [
      'Você consegue! 💪',
      'Continue tentando! 🌈',
      'Quase lá! 🎯',
      'Não desista! ✨',
      'Você está aprendendo! 🧠'
    ],
    streak: [
      'Sua sequência está incrível! 🔥',
      'Continue estudando todo dia! ⚡',
      'Você está no ritmo! 🎵'
    ]
  }
};

// Utilitários para linguagem simplificada (crianças 8-12 anos)
export const kidFriendlyLabels = {
  navigation: {
    dashboard: 'Início',
    upload: 'Enviar Foto',
    summaries: 'Meus Resumos',
    flashcards: 'Cartões de Estudo',
    quiz: 'Jogar Quiz',
    progress: 'Meu Progresso',
    social: 'Amigos'
  },
  actions: {
    start: 'Começar',
    continue: 'Continuar',
    finish: 'Terminar',
    retry: 'Tentar de Novo',
    skip: 'Pular',
    next: 'Próximo',
    previous: 'Anterior',
    save: 'Salvar',
    cancel: 'Cancelar'
  },
  feedback: {
    correct: 'Acertou! 🎉',
    incorrect: 'Quase! Tente de novo 💪',
    loading: 'Carregando...',
    saving: 'Salvando...',
    success: 'Pronto!',
    error: 'Ops! Algo deu errado'
  },
  stats: {
    xp: 'Pontos de Experiência',
    level: 'Nível',
    streak: 'Dias Seguidos',
    accuracy: 'Taxa de Acerto',
    reviewed: 'Revisados',
    completed: 'Completados'
  }
};
