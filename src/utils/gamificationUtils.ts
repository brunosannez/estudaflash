
// Calcular nível baseado no XP
export const calculateLevel = (xp: number): number => {
  if (xp < 50) return 1;
  if (xp < 150) return 2;
  if (xp < 300) return 3;
  return Math.floor((xp - 300) / 200) + 4;
};

// Calcular XP necessário para o próximo nível
export const getXpForNextLevel = (currentLevel: number): number => {
  if (currentLevel === 1) return 50;
  if (currentLevel === 2) return 150;
  if (currentLevel === 3) return 300;
  return 300 + (currentLevel - 3) * 200;
};

// Calcular XP mínimo do nível atual
export const getXpForCurrentLevel = (currentLevel: number): number => {
  if (currentLevel === 1) return 0;
  if (currentLevel === 2) return 50;
  if (currentLevel === 3) return 150;
  return 300 + (currentLevel - 4) * 200;
};

// Calcular streak baseado na última atividade
export const calculateStreak = (lastActivityDate: string | null): number => {
  const today = new Date().toISOString().split('T')[0];
  
  if (!lastActivityDate || lastActivityDate === today) {
    return 1;
  }

  const lastDate = new Date(lastActivityDate);
  const todayDate = new Date(today);
  const diffTime = todayDate.getTime() - lastDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return 1; // Will be incremented in the hook
  } else if (diffDays > 1) {
    return 1; // Reset streak
  }
  
  return 1;
};

// Calcular progresso XP para o nível atual (corrigido)
export const calculateXpProgress = (currentXp: number, currentLevel: number): number => {
  const nextLevelXp = getXpForNextLevel(currentLevel);
  const currentLevelMinXp = getXpForCurrentLevel(currentLevel);
  
  // Se já tem XP suficiente para o próximo nível, deve estar em 100%
  if (currentXp >= nextLevelXp) {
    return 100;
  }
  
  // Calcular progresso entre o nível atual e próximo
  const xpInCurrentLevel = currentXp - currentLevelMinXp;
  const xpNeededForLevel = nextLevelXp - currentLevelMinXp;
  
  if (xpNeededForLevel <= 0) return 100;
  
  const progress = (xpInCurrentLevel / xpNeededForLevel) * 100;
  return Math.min(100, Math.max(0, progress));
};
