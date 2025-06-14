
// Sistema de design unificado para o app
export const designColors = {
  gradients: {
    primary: 'from-purple-100 via-pink-100 to-blue-100',
    secondary: 'from-yellow-50 via-pink-50 to-blue-50',
    accent: 'from-blue-50 via-white to-purple-50',
    warm: 'from-orange-100 via-pink-100 to-purple-100',
    cool: 'from-green-100 via-blue-100 to-purple-100'
  },
  cards: {
    primary: 'bg-white/95 backdrop-blur-sm shadow-xl border-0 rounded-2xl',
    secondary: 'bg-gradient-to-r from-white/90 to-purple-50/90 backdrop-blur-sm shadow-lg rounded-xl',
    accent: 'bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200'
  },
  buttons: {
    primary: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    secondary: 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600',
    success: 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
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
