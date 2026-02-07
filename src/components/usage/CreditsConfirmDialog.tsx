import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Coins } from 'lucide-react';

interface CreditsConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  actionName: string;
  creditsCost: number;
  creditsAvailable: number;
}

const CreditsConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  actionName,
  creditsCost,
  creditsAvailable,
}: CreditsConfirmDialogProps) => {
  const remaining = creditsAvailable - creditsCost;
  const canProceed = creditsAvailable >= creditsCost;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Confirmar {actionName}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-muted-foreground text-xs">Custo</p>
                  <p className="text-lg font-bold text-primary">{creditsCost}</p>
                  <p className="text-muted-foreground text-xs">crédito(s)</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-muted-foreground text-xs">Saldo atual</p>
                  <p className="text-lg font-bold">{creditsAvailable}</p>
                  <p className="text-muted-foreground text-xs">crédito(s)</p>
                </div>
              </div>

              {canProceed ? (
                <p className="text-sm text-emerald-600 bg-emerald-50 rounded-lg p-2 text-center">
                  Após esta ação, você terá <strong>{remaining}</strong> crédito(s) restantes.
                </p>
              ) : (
                <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-2 text-center">
                  ⚠️ Créditos insuficientes! Você precisa de {creditsCost} mas tem apenas {creditsAvailable}.
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={!canProceed}>
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CreditsConfirmDialog;
