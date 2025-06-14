
// Calcular nível baseado no XP
export const calculateLevel = (xp: number): number => {
  if (xp <= 50) return 1;
  if (xp <= 150) return 2;
  if (xp <= 300) return 3;
  return Math.floor((xp - 300) / 200) + 4;
};

// Calcular XP necessário para o próximo nível
export const getXpForNextLevel = (currentLevel: number): number => {
  if (currentLevel === 1) return 50;
  if (currentLevel === 2) return 150;
  if (currentLevel === 3) return 300;
  return 300 + (currentLevel - 3) * 200;
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

// Calcular progresso XP para o nível atual
export const calculateXpProgress = (currentXp: number, currentLevel: number): number => {
  const nextLevelXp = getXpForNextLevel(currentLevel);
  const currentLevelMinXp = currentLevel === 1 ? 0 : 
    currentLevel === 2 ? 50 : 
    currentLevel === 3 ? 150 : 
    300 + (currentLevel - 4) * 200;

  return ((currentXp - currentLevelMinXp) / (nextLevelXp - currentLevelMinXp)) * 100;
};
