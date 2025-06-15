
import { supabase } from "@/integrations/supabase/client";
import { UserProgress } from "@/types/gamification";
import { calculateLevel } from "@/utils/gamificationUtils";

export class UserProgressService {
  // Buscar ou criar progresso do usuário com retry e verificação de dados históricos
  static async fetchOrCreateUserProgress(userId: string): Promise<UserProgress | null> {
    console.log('🔍 Fetching user progress for:', userId);
    
    try {
      const { data: progressData, error: progressError } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (progressError) {
        console.error("❌ Error fetching progress:", progressError);
        throw progressError;
      }

      if (!progressData) {
        console.log('📝 Creating new user progress with historical data verification');
        
        // Verificar se há dados históricos para calcular progresso inicial correto
        const { HistoricalCalculationService } = await import('./historicalCalculationService');
        const historicalData = await HistoricalCalculationService.calculateHistoricalProgress(userId);
        
        const { data: newProgress, error: createError } = await supabase
          .from("user_progress")
          .insert({
            user_id: userId,
            total_xp: historicalData.totalXp,
            current_level: historicalData.level,
            current_streak: historicalData.streak.current,
            longest_streak: historicalData.streak.longest,
            last_activity_date: historicalData.streak.lastActivity
          })
          .select()
          .single();
          
        if (createError) {
          console.error("❌ Error creating progress:", createError);
          throw createError;
        }
        
        console.log('✅ New progress created with historical data:', newProgress);
        return newProgress;
      }

      // Verificar se o progresso existente está atualizado
      const { HistoricalCalculationService } = await import('./historicalCalculationService');
      const historicalData = await HistoricalCalculationService.calculateHistoricalProgress(userId);
      
      // Se há uma discrepância significativa, atualizar
      if (Math.abs(progressData.total_xp - historicalData.totalXp) > 10) {
        console.log('🔄 Progress data inconsistent, updating...');
        
        const { data: updatedProgress, error: updateError } = await supabase
          .from("user_progress")
          .update({
            total_xp: historicalData.totalXp,
            current_level: historicalData.level,
            current_streak: historicalData.streak.current,
            longest_streak: Math.max(historicalData.streak.longest, progressData.longest_streak),
            last_activity_date: historicalData.streak.lastActivity,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", userId)
          .select()
          .single();
          
        if (updateError) {
          console.error("❌ Error updating progress:", updateError);
          return progressData; // Retorna dados existentes em caso de erro
        }
        
        console.log('✅ Progress updated with historical data:', updatedProgress);
        return updatedProgress;
      }

      console.log('✅ Progress found and consistent:', progressData);
      return progressData;
    } catch (error) {
      console.error("❌ Critical error in fetchOrCreateUserProgress:", error);
      throw error;
    }
  }

  // Atualizar progresso do usuário
  static async updateUserProgress(
    userId: string,
    progress: UserProgress,
    xpAmount: number
  ): Promise<UserProgress | null> {
    console.log('📈 Updating user progress:', { userId, xpAmount });
    
    try {
      const newTotalXp = progress.total_xp + xpAmount;
      const newLevel = calculateLevel(newTotalXp);
      const today = new Date().toISOString().split('T')[0];

      // Calcular streak
      let newStreak = progress.current_streak;
      if (progress.last_activity_date !== today) {
        const lastDate = progress.last_activity_date ? new Date(progress.last_activity_date) : null;
        const todayDate = new Date(today);
        
        if (lastDate) {
          const diffTime = todayDate.getTime() - lastDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            newStreak = progress.current_streak + 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }
      }

      const updateData = {
        total_xp: newTotalXp,
        current_level: newLevel,
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, progress.longest_streak),
        last_activity_date: today,
        updated_at: new Date().toISOString()
      };

      console.log('📊 Progress update data:', updateData);

      const { data: updatedProgress, error } = await supabase
        .from("user_progress")
        .update(updateData)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        console.error("❌ Error updating progress:", error);
        throw error;
      }

      console.log('✅ Progress updated successfully:', updatedProgress);
      return updatedProgress;
    } catch (error) {
      console.error("❌ Critical error in updateUserProgress:", error);
      throw error;
    }
  }
}
