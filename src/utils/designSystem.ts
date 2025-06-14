
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
