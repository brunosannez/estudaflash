
// Sistema de design unificado para o app - Paleta Moderna e Acessível
// Cores principais: Cyan (estudo), Violet (ação), Emerald (sucesso)

export const designColors = {
  gradients: {
    primary: 'from-background to-muted/50',
    secondary: 'from-background to-muted/30',
    accent: 'from-primary/5 to-background',
    warm: 'from-background to-muted/40',
    cool: 'from-background to-muted/40',
    hero: 'from-primary/10 via-background to-background'
  },
  cards: {
    primary: 'bg-card border border-border rounded-xl',
    secondary: 'bg-card border border-border rounded-xl',
    accent: 'bg-primary/5 border border-primary/20 rounded-xl',
    interactive: 'bg-card border border-border hover:border-primary/40 hover:shadow-sm transition-colors duration-200 rounded-xl'
  },
  buttons: {
    primary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    secondary: 'bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white',
    ghost: 'bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground',
    outline: 'bg-transparent border border-border text-foreground hover:bg-muted'
  },
  backgrounds: {
    main: 'bg-background',
    card: 'bg-card border border-border',
    header: 'bg-background/90 backdrop-blur-md border-b border-border',
    section: 'bg-background'
  },
  text: {
    primary: 'text-foreground',
    secondary: 'text-muted-foreground',
    accent: 'text-primary',
    muted: 'text-muted-foreground',
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    error: 'text-destructive'
  },
  borders: {
    light: 'border-border',
    medium: 'border-border',
    accent: 'border-primary/30',
    success: 'border-emerald-300 dark:border-emerald-800'
  },
  animations: {
    cardHover: 'hover:shadow-sm transition-shadow duration-200',
    buttonHover: 'active:scale-[0.98] transition-transform duration-150',
    iconFloat: '',
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
    captionText: 'text-xs sm:text-sm text-muted-foreground',
    
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
    xp: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-900',
    streak: 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950/40 dark:border-orange-900',
    level: 'text-primary bg-primary/10 border-primary/20',
    badge: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-900'
  },
  // Cores para feedback de estudo
  study: {
    correct: 'text-emerald-700 bg-emerald-50 border-emerald-300 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-800',
    incorrect: 'text-rose-700 bg-rose-50 border-rose-300 dark:text-rose-400 dark:bg-rose-950/40 dark:border-rose-800',
    neutral: 'text-primary bg-primary/10 border-primary/30',
    warning: 'text-amber-700 bg-amber-50 border-amber-300 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-800'
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
