import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Coins, 
  Zap, 
  RefreshCw, 
  TrendingUp, 
  Eye, 
  FileText, 
  Brain, 
  HelpCircle 
} from 'lucide-react';
import { useCreditsSystem } from '@/hooks/useCreditsSystem';
import { motion } from 'framer-motion';

interface CreditsIndicatorProps {
  onUpgrade?: () => void;
  onViewHistory?: () => void;
}

const CreditsIndicator = ({ onUpgrade, onViewHistory }: CreditsIndicatorProps) => {
  const {
    userCredits,
    creditsConfig,
    loading,
    getUsagePercentage,
    getUsageEstimates,
    getActionCreditsCost,
    isNearLimit,
    isAtLimit,
    refreshUserCredits
  } = useCreditsSystem();

  if (loading && !userCredits) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-4 bg-muted rounded w-3/4"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-2 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userCredits) {
    return (
      <Card className="border-destructive/20">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Coins className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Erro ao carregar créditos</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshUserCredits}
              className="mt-2"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const usagePercentage = getUsagePercentage();
  const estimates = getUsageEstimates();

  // Ícones para cada tipo de ação
  const actionIcons: Record<string, any> = {
    ocr: Eye,
    summary: FileText,
    flashcards: Brain,
    quiz: HelpCircle,
  };

  // Nomes amigáveis para as ações
  const actionNames: Record<string, string> = {
    ocr: 'Imagem',
    summary: 'Resumo',
    flashcards: 'Flashcards',
    quiz: 'Quiz',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`${isAtLimit() ? 'border-destructive/50' : isNearLimit() ? 'border-warning/50' : 'border-primary/20'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Coins className={`h-4 w-4 ${isAtLimit() ? 'text-destructive' : isNearLimit() ? 'text-warning' : 'text-primary'}`} />
              <span>Créditos</span>
            </div>
            
            <div className="flex items-center gap-2">
              {isAtLimit() && (
                <Badge variant="destructive" className="text-xs">
                  Esgotado
                </Badge>
              )}
              {isNearLimit() && !isAtLimit() && (
                <Badge variant="secondary" className="text-xs">
                  Baixo
                </Badge>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshUserCredits}
                disabled={loading}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Barra de progresso de uso */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {userCredits.remaining} restantes
              </span>
              <span className="font-medium">
                {userCredits.total_per_month} total/mês
              </span>
            </div>
            
            <Progress 
              value={100 - usagePercentage} 
              className={`h-2 ${isAtLimit() ? '[&>div]:bg-destructive' : isNearLimit() ? '[&>div]:bg-warning' : ''}`}
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{userCredits.used_this_month} usados este mês</span>
              <span>{usagePercentage.toFixed(1)}% utilizado</span>
            </div>
          </div>

          {/* Estimativas de uso */}
          {creditsConfig.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-3 w-3" />
                <span>Você ainda pode criar:</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(estimates).map(([actionType, count]) => {
                  const Icon = actionIcons[actionType] || Zap;
                  const cost = getActionCreditsCost(actionType);
                  
                  return (
                    <div 
                      key={actionType}
                      className="flex items-center justify-between p-2 bg-muted/30 rounded-md text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-3 w-3 text-primary" />
                        <span>{actionNames[actionType] || actionType}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{count}x</div>
                        <div className="text-muted-foreground">
                          {cost} {cost === 1 ? 'crédito' : 'créditos'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-2 pt-2">
            {onViewHistory && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewHistory}
                className="flex-1 text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                Histórico
              </Button>
            )}
            
            {onUpgrade && (isAtLimit() || isNearLimit()) && (
              <Button
                size="sm"
                onClick={onUpgrade}
                className="flex-1 text-xs"
              >
                <Zap className="h-3 w-3 mr-1" />
                Upgrade
              </Button>
            )}
          </div>

          {/* Mensagem de aviso */}
          {isAtLimit() && (
            <div className="text-xs text-destructive bg-destructive/10 p-2 rounded-md">
              ⚠️ Seus créditos se esgotaram. Faça upgrade para continuar usando a plataforma.
            </div>
          )}
          
          {isNearLimit() && !isAtLimit() && (
            <div className="text-xs text-warning bg-warning/10 p-2 rounded-md">
              ⚠️ Poucos créditos restantes. Considere fazer upgrade do seu plano.
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CreditsIndicator;