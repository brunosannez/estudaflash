
import { supabase } from '@/integrations/supabase/client';
import { UsageDataService, type UsageData } from './usageDataService';
import { type ActionType } from './usageLimitsConfig';

export class UsageIncrementService {
  static async incrementUsage(userId: string, actionType: ActionType): Promise<void> {
    try {
      console.log(`📈 Incrementando uso - ${actionType} para usuário:`, userId);
      
      const fieldMap = {
        uploads: 'uploads_realizados',
        flashcards: 'flashcards_gerados',
        quizzes: 'quizzes_realizados',
      };

      const field = fieldMap[actionType];
      
      const currentUsage = await UsageDataService.getUserUsage(userId);
      if (!currentUsage) {
        throw new Error('Usuário não encontrado');
      }

      const { error } = await supabase
        .from('uso_usuarios')
        .update({
          [field]: currentUsage[field as keyof UsageData] as number + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Erro ao incrementar uso:', error);
        throw error;
      }

      console.log(`✅ Uso incrementado com sucesso - ${actionType}`);
    } catch (error) {
      console.error('❌ Erro no incrementUsage:', error);
      throw error;
    }
  }
}
