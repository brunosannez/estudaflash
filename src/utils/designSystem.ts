
// Sistema de design unificado para o app - Nova Paleta Profissional
export const designColors = {
  gradients: {
    primary: 'from-blue-50 via-cyan-50 to-purple-100', // Azul bebê base
    secondary: 'from-green-100 via-cyan-100 to-blue-50', // Verde água e azul bebê
    accent: 'from-purple-100 via-blue-50 to-cyan-50', // Lilás suave com azul bebê
    warm: 'from-cyan-100 via-green-100 to-purple-100', // Mix harmonioso
    cool: 'from-blue-50 via-cyan-100 to-green-100' // Tons frios profissionais
  },
  cards: {
    primary: 'bg-white/95 backdrop-blur-sm shadow-xl border border-cyan-200 rounded-2xl',
    secondary: 'bg-gradient-to-r from-white/90 to-green-50/90 backdrop-blur-sm shadow-lg border border-green-200 rounded-xl',
    accent: 'bg-gradient-to-br from-purple-50 to-cyan-50 border-2 border-purple-300'
  },
  buttons: {
    primary: 'bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600', // Lilás suave
    secondary: 'bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600', // Azul piscina
    success: 'bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600', // Verde água
    warning: 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500'
  },
  backgrounds: {
    main: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50', // Azul bebê (#E3FDFD) base
    card: 'bg-white/90 border border-cyan-200', // Cards limpos com borda azul piscina
    header: 'bg-white/95 backdrop-blur-sm border-b-4 border-cyan-300' // Header profissional
  },
  text: {
    primary: 'text-gray-700', // Cinza escuro (#505050)
    secondary: 'text-gray-600',
    accent: 'text-purple-600', // Lilás para destaques
    light: 'text-gray-500'
  },
  animations: {
    cardHover: 'hover:scale-105 hover:shadow-2xl transition-all duration-300',
    buttonHover: 'hover:scale-105 transition-all duration-200',
    iconFloat: 'hover:animate-bounce',
    slideIn: 'animate-fade-in'
  },
  // Novo: Classes responsivas para mobile
  responsive: {
    // Títulos principais
    heroTitle: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl',
    pageTitle: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl',
    sectionTitle: 'text-lg sm:text-xl md:text-2xl lg:text-3xl',
    cardTitle: 'text-base sm:text-lg md:text-xl',
    
    // Textos e descrições
    heroText: 'text-sm sm:text-base md:text-lg lg:text-xl',
    bodyText: 'text-xs sm:text-sm md:text-base',
    captionText: 'text-xs sm:text-sm',
    
    // Ícones
    heroIcon: 'h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12',
    pageIcon: 'h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8',
    cardIcon: 'h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6',
    buttonIcon: 'h-3 w-3 sm:h-4 sm:w-4',
    
    // Espaçamentos
    containerPadding: 'px-2 sm:px-4 md:px-6 lg:px-8',
    sectionSpacing: 'space-y-4 sm:space-y-6 md:space-y-8',
    cardPadding: 'p-3 sm:p-4 md:p-6',
    buttonPadding: 'py-2 px-3 sm:py-3 sm:px-4 md:py-4 md:px-6',
    
    // Layouts de grid
    gridCols1: 'grid-cols-1',
    gridCols2: 'grid-cols-1 sm:grid-cols-2',
    gridCols3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    gridCols4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    
    // Elementos flutuantes (reduzidos no mobile)
    floatingElements: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl opacity-10 sm:opacity-20',
    
    // Novos: Botões das abas otimizados para mobile
    tabButton: 'min-h-[64px] sm:min-h-[80px] md:min-h-[48px] px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-2 min-w-[80px] sm:min-w-[100px] md:min-w-[120px] touch-target-44'
  }
};

export const playfulElements = {
  emojis: {
    study: ['📚', '🎓', '🧠', '✨', '🌟', '⭐', '🎯', '🏆'],
    quiz: ['🎯', '🎮', '🏅', '🎪', '🎨', '🎭', '🎊', '🎉'],
    flashcard: ['🧠', '💡', '🔥', '⚡', '🌟', '✨', '🎪', '🎨'],
    progress: ['🏆', '📈', '🎯', '🌟', '⭐', '🔥', '💪', '🚀']
  }
};
