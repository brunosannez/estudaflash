
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShieldX, Loader2 } from 'lucide-react';

interface UserBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  userEmail: string;
}

const BLOCK_REASONS = [
  { value: 'inadimplencia', label: 'Inadimplência / Falta de Pagamento' },
  { value: 'violacao_termos', label: 'Violação dos Termos de Uso' },
  { value: 'abuso_sistema', label: 'Abuso do Sistema' },
  { value: 'solicitacao_usuario', label: 'Solicitação do Próprio Usuário' },
  { value: 'fraude', label: 'Suspeita de Fraude' },
  { value: 'outro', label: 'Outro Motivo' },
];

const UserBlockModal = ({ isOpen, onClose, onConfirm, userEmail }: UserBlockModalProps) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    const reason = selectedReason === 'outro' 
      ? customReason 
      : BLOCK_REASONS.find(r => r.value === selectedReason)?.label || selectedReason;
    
    if (!reason.trim()) return;
    
    setLoading(true);
    try {
      await onConfirm(reason);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <ShieldX className="h-5 w-5" />
            Bloquear Usuário
          </DialogTitle>
          <DialogDescription>
            Você está prestes a bloquear o usuário <strong>{userEmail}</strong>. 
            O usuário não poderá acessar o sistema até ser desbloqueado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo do Bloqueio</Label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um motivo..." />
              </SelectTrigger>
              <SelectContent>
                {BLOCK_REASONS.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedReason === 'outro' && (
            <div className="space-y-2">
              <Label htmlFor="custom-reason">Especifique o motivo</Label>
              <Textarea
                id="custom-reason"
                placeholder="Descreva o motivo do bloqueio..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={loading || !selectedReason || (selectedReason === 'outro' && !customReason.trim())}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Bloqueando...
              </>
            ) : (
              <>
                <ShieldX className="h-4 w-4 mr-2" />
                Bloquear Usuário
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserBlockModal;
