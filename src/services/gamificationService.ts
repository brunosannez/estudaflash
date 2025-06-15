
import { UserProgress, DailyActivity, ActivityType } from "@/types/gamification";
import { UserProgressService } from "./userProgressService";
import { DailyActivityService } from "./dailyActivityService";
import { HistoricalCalculationService } from "./historicalCalculationService";

export class GamificationService {
  // Buscar ou criar progresso do usuário
  static async fetchOrCreateUserProgress(userId: string): Promise<UserProgress | null> {
    return UserProgressService.fetchOrCreateUserProgress(userId);
  }

  // Calcular progresso baseado em dados históricos
  static async calculateHistoricalProgress(userId: string) {
    return HistoricalCalculationService.calculateHistoricalProgress(userId);
  }

  // Calcular streak real baseado em atividades
  static async calculateRealStreak(userId: string) {
    return HistoricalCalculationService.calculateRealStreak(userId);
  }

  // Buscar ou criar atividade diária
  static async fetchOrCreateDailyActivity(userId: string): Promise<DailyActivity | null> {
    return DailyActivityService.fetchOrCreateDailyActivity(userId);
  }

  // Atualizar progresso do usuário
  static async updateUserProgress(
    userId: string,
    progress: UserProgress,
    xpAmount: number
  ): Promise<UserProgress | null> {
    return UserProgressService.updateUserProgress(userId, progress, xpAmount);
  }

  // Atualizar atividade diária
  static async updateDailyActivity(
    userId: string,
    activity: DailyActivity,
    xpAmount: number,
    activityType: ActivityType
  ): Promise<DailyActivity | null> {
    return DailyActivityService.updateDailyActivity(userId, activity, xpAmount, activityType);
  }
}
