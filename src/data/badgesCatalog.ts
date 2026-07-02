
export interface BadgeDefinition {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'achievement' | 'social' | 'seasonal' | 'collaborative';
  requirement: {
    metric: string;
    value: number;
    comparator: 'gte' | 'eq' | 'lte';
  };
  kidFriendlyDescription: string;
}

export const BADGES_CATALOG: BadgeDefinition[] = [
  // ============================================
  // CATEGORIA: PRIMEIROS PASSOS (Common)
  // ============================================
  {
    id: 'first_upload',
    type: 'first_upload',
    name: 'Primeiro Upload',
    description: 'Fez seu primeiro upload de material',
    kidFriendlyDescription: 'Você mandou seu primeiro arquivo! 📄',
    icon: '🌱',
    rarity: 'common',
    category: 'achievement',
    requirement: { metric: 'uploads_count', value: 1, comparator: 'gte' }
  },
  {
    id: 'first_summary',
    type: 'first_summary',
    name: 'Primeiro Resumo',
    description: 'Gerou seu primeiro resumo de estudos',
    kidFriendlyDescription: 'Seu primeiro resumo foi criado! 📝',
    icon: '📝',
    rarity: 'common',
    category: 'achievement',
    requirement: { metric: 'summaries_count', value: 1, comparator: 'gte' }
  },
  {
    id: 'first_quiz',
    type: 'first_quiz',
    name: 'Primeiro Quiz',
    description: 'Completou seu primeiro quiz ENEM',
    kidFriendlyDescription: 'Você fez seu primeiro quiz! 🧠',
    icon: '🧠',
    rarity: 'common',
    category: 'achievement',
    requirement: { metric: 'quizzes_completed', value: 1, comparator: 'gte' }
  },
  {
    id: 'first_flashcard',
    type: 'first_flashcard',
    name: 'Primeiro Flash',
    description: 'Revisou seu primeiro flashcard',
    kidFriendlyDescription: 'Seu primeiro flashcard foi estudado! 💡',
    icon: '💡',
    rarity: 'common',
    category: 'achievement',
    requirement: { metric: 'flashcards_reviewed', value: 1, comparator: 'gte' }
  },

  // ============================================
  // CATEGORIA: MEMÓRIA DE ELEFANTE - Flashcards (Rare)
  // ============================================
  {
    id: 'elephant_memory',
    type: 'elephant_memory',
    name: 'Memória de Elefante',
    description: '100 flashcards corretos',
    kidFriendlyDescription: 'Você lembrou de 100 flashcards! 🐘',
    icon: '🐘',
    rarity: 'rare',
    category: 'achievement',
    requirement: { metric: 'flashcards_correct', value: 100, comparator: 'gte' }
  },
  {
    id: 'perfect_accuracy',
    type: 'perfect_accuracy',
    name: 'Precisão Total',
    description: '10 sessões de flashcard com 100% de acerto',
    kidFriendlyDescription: 'Você acertou TUDO em 10 sessões! 🎯',
    icon: '🎯',
    rarity: 'rare',
    category: 'achievement',
    requirement: { metric: 'perfect_sessions', value: 10, comparator: 'gte' }
  },
  {
    id: 'voracious_reader',
    type: 'voracious_reader',
    name: 'Leitor Voraz',
    description: '500 flashcards revisados no total',
    kidFriendlyDescription: 'Você estudou 500 flashcards! 📚',
    icon: '📚',
    rarity: 'rare',
    category: 'achievement',
    requirement: { metric: 'flashcards_reviewed', value: 500, comparator: 'gte' }
  },

  // ============================================
  // CATEGORIA: MESTRE DO QUIZ (Rare/Epic)
  // ============================================
  {
    id: 'speedster',
    type: 'speedster',
    name: 'Velocista',
    description: 'Quiz completo em menos de 2 minutos',
    kidFriendlyDescription: 'Você foi super rápido no quiz! ⚡',
    icon: '⚡',
    rarity: 'rare',
    category: 'achievement',
    requirement: { metric: 'fast_quiz', value: 1, comparator: 'gte' }
  },
  {
    id: 'sharpshooter',
    type: 'sharpshooter',
    name: 'Atirador Certeiro',
    description: '100% de acerto em 5 quizzes',
    kidFriendlyDescription: 'Você gabaritou 5 quizzes! 🎯',
    icon: '🎯',
    rarity: 'epic',
    category: 'achievement',
    requirement: { metric: 'perfect_quizzes', value: 5, comparator: 'gte' }
  },
  {
    id: 'studious',
    type: 'studious',
    name: 'Estudioso',
    description: '25 quizzes completados',
    kidFriendlyDescription: 'Você já fez 25 quizzes! 📖',
    icon: '📖',
    rarity: 'rare',
    category: 'achievement',
    requirement: { metric: 'quizzes_completed', value: 25, comparator: 'gte' }
  },
  {
    id: 'quiz_master',
    type: 'quiz_master',
    name: 'Mestre do Quiz',
    description: '100 quizzes completados',
    kidFriendlyDescription: 'Você é um mestre dos quizzes! 🏆',
    icon: '🏆',
    rarity: 'epic',
    category: 'achievement',
    requirement: { metric: 'quizzes_completed', value: 100, comparator: 'gte' }
  },

  // ============================================
  // CATEGORIA: STREAK E CONSTÂNCIA (Epic/Legendary)
  // ============================================
  {
    id: 'first_week',
    type: 'first_week',
    name: 'Primeira Semana',
    description: '7 dias de streak',
    kidFriendlyDescription: 'Uma semana estudando todo dia! ✨',
    icon: '✨',
    rarity: 'rare',
    category: 'achievement',
    requirement: { metric: 'current_streak', value: 7, comparator: 'gte' }
  },
  {
    id: 'eternal_fire',
    type: 'eternal_fire',
    name: 'Fogo Eterno',
    description: '30 dias de streak consecutivos',
    kidFriendlyDescription: 'Um mês inteiro estudando! 🔥',
    icon: '🔥',
    rarity: 'epic',
    category: 'achievement',
    requirement: { metric: 'current_streak', value: 30, comparator: 'gte' }
  },
  {
    id: 'diamond',
    type: 'diamond',
    name: 'Diamante',
    description: '100 dias de streak consecutivos',
    kidFriendlyDescription: 'Você é incrível! 100 dias seguidos! 💎',
    icon: '💎',
    rarity: 'legendary',
    category: 'achievement',
    requirement: { metric: 'longest_streak', value: 100, comparator: 'gte' }
  },

  // ============================================
  // CATEGORIA: XP E NÍVEIS (Common/Rare/Epic/Legendary)
  // ============================================
  {
    id: 'level_5',
    type: 'level_5',
    name: 'Estudante Dedicado',
    description: 'Alcançou o nível 5',
    kidFriendlyDescription: 'Você chegou no nível 5! ⭐',
    icon: '⭐',
    rarity: 'common',
    category: 'achievement',
    requirement: { metric: 'current_level', value: 5, comparator: 'gte' }
  },
  {
    id: 'level_10',
    type: 'level_10',
    name: 'Acadêmico',
    description: 'Alcançou o nível 10',
    kidFriendlyDescription: 'Nível 10! Você está arrasando! 🎓',
    icon: '🎓',
    rarity: 'rare',
    category: 'achievement',
    requirement: { metric: 'current_level', value: 10, comparator: 'gte' }
  },
  {
    id: 'level_25',
    type: 'level_25',
    name: 'Mestre dos Estudos',
    description: 'Alcançou o nível 25',
    kidFriendlyDescription: 'Nível 25! Você é um mestre! 👑',
    icon: '👑',
    rarity: 'epic',
    category: 'achievement',
    requirement: { metric: 'current_level', value: 25, comparator: 'gte' }
  },
  {
    id: 'xp_1000',
    type: 'xp_1000',
    name: 'Colecionador XP',
    description: '1.000 XP acumulados',
    kidFriendlyDescription: 'Você juntou 1.000 XP! 💰',
    icon: '💰',
    rarity: 'common',
    category: 'achievement',
    requirement: { metric: 'total_xp', value: 1000, comparator: 'gte' }
  },
  {
    id: 'xp_10000',
    type: 'xp_10000',
    name: 'Especialista',
    description: '10.000 XP acumulados',
    kidFriendlyDescription: 'Uau! 10.000 XP conquistados! 💯',
    icon: '💯',
    rarity: 'epic',
    category: 'achievement',
    requirement: { metric: 'total_xp', value: 10000, comparator: 'gte' }
  },

  // ============================================
  // CATEGORIA: HORÁRIOS ESPECIAIS (Seasonal)
  // ============================================
  {
    id: 'early_bird',
    type: 'early_bird',
    name: 'Madrugador',
    description: 'Estudou antes das 7h da manhã',
    kidFriendlyDescription: 'Acordou cedo para estudar! ☀️',
    icon: '☀️',
    rarity: 'rare',
    category: 'seasonal',
    requirement: { metric: 'early_study', value: 1, comparator: 'gte' }
  },
  {
    id: 'night_owl',
    type: 'night_owl',
    name: 'Coruja',
    description: 'Estudou depois das 22h',
    kidFriendlyDescription: 'Estudou à noite como uma coruja! 🌙',
    icon: '🌙',
    rarity: 'rare',
    category: 'seasonal',
    requirement: { metric: 'night_study', value: 1, comparator: 'gte' }
  }
];

export const getBadgeById = (id: string): BadgeDefinition | undefined => {
  return BADGES_CATALOG.find(badge => badge.id === id);
};

export const getBadgesByCategory = (category: BadgeDefinition['category']): BadgeDefinition[] => {
  return BADGES_CATALOG.filter(badge => badge.category === category);
};

export const getBadgesByRarity = (rarity: BadgeDefinition['rarity']): BadgeDefinition[] => {
  return BADGES_CATALOG.filter(badge => badge.rarity === rarity);
};

export const getRarityStyles = (rarity: BadgeDefinition['rarity']) => {
  const styles = {
    common: {
      bg: 'bg-slate-100',
      border: 'border-slate-300',
      text: 'text-slate-700',
      glow: ''
    },
    rare: {
      bg: 'bg-primary/5',
      border: 'border-blue-400',
      text: 'text-primary',
      glow: ''
    },
    epic: {
      bg: 'bg-primary/5',
      border: 'border-primary',
      text: 'text-primary',
      glow: 'shadow-primary/20'
    },
    legendary: {
      bg: 'bg-gradient-to-r from-yellow-100 to-amber-100',
      border: 'border-yellow-400',
      text: 'text-yellow-700',
      glow: 'shadow-lg shadow-yellow-200 animate-pulse'
    }
  };
  return styles[rarity];
};

export const getRarityLabel = (rarity: BadgeDefinition['rarity']) => {
  const labels = {
    common: 'Comum',
    rare: 'Raro',
    epic: 'Épico',
    legendary: 'Lendário'
  };
  return labels[rarity];
};
