import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Eye, FileText, Brain, HelpCircle, Coins, Clock, X } from 'lucide-react';
import { useCreditsSystem } from '@/hooks/useCreditsSystem';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CreditsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreditsHistoryModal = ({ isOpen, onClose }: CreditsHistoryModalProps) => {
  const { creditsHistory, userCredits, loading } = useCreditsSystem();

  const actionIcons: Record<string, any> = {
    ocr: Eye,
    summary: FileText,
    flashcards: Brain,
    quiz: HelpCircle,
  };

  const actionNames: Record<string, string> = {
    ocr: 'Processamento de Imagem',
    summary: 'Geração de Resumo',
    flashcards: 'Criação de Flashcards',
    quiz: 'Geração de Quiz',
  };

  const actionColors: Record<string, string> = {
    ocr: 'bg-primary/10 text-blue-800',
    summary: 'bg-green-100 text-green-800',
    flashcards: 'bg-primary/10 text-purple-800',
    quiz: 'bg-orange-100 text-orange-800',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Histórico de Créditos
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="ml-auto h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumo atual */}
          {userCredits && (
            <div className="p-4 bg-primary/5 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">Situação Atual</h3>
                <Badge variant="outline" className="text-xs">
                  Este Mês
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {userCredits.remaining}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Restantes
                  </div>
                </div>
                
                <div>
                  <div className="text-2xl font-bold text-muted-foreground">
                    {userCredits.used_this_month}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Utilizados
                  </div>
                </div>
                
                <div>
                  <div className="text-2xl font-bold text-muted-foreground">
                    {userCredits.total_per_month}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total/Mês
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Histórico de transações */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Últimas Transações</h3>
            
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                    <div className="h-8 w-8 bg-muted rounded"></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                      <div className="h-2 bg-muted rounded w-1/2"></div>
                    </div>
                    <div className="h-4 w-12 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : creditsHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Coins className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma transação ainda</p>
                <p className="text-xs">Suas atividades aparecerão aqui</p>
              </div>
            ) : (
              <ScrollArea className="h-80">
                <div className="space-y-2">
                  {creditsHistory.map((transaction, index) => {
                    const Icon = actionIcons[transaction.action_type] || Coins;
                    const actionName = actionNames[transaction.action_type] || transaction.action_type;
                    const colorClass = actionColors[transaction.action_type] || 'bg-muted text-foreground';
                    
                    return (
                      <div key={transaction.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                        <div className={`p-2 rounded-full ${colorClass}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">
                              {actionName}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {format(new Date(transaction.created_at), 'dd/MM HH:mm', { locale: ptBR })}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-1">
                            <div className="text-xs text-muted-foreground">
                              -{transaction.credits_consumed} crédito(s)
                            </div>
                            <div className="text-xs font-medium">
                              {transaction.credits_remaining_after} restantes
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreditsHistoryModal;