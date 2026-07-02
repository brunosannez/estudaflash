
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Calendar, School, Shield, Mail, Phone, UserCheck, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { formatCPF } from '@/utils/signupValidation';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    user_id: string;
    email: string;
    plano: string;
    created_at: string;
    uploads_realizados: number;
    flashcards_gerados: number;
    quizzes_realizados: number;
    is_admin: boolean;
    storage_mb: number;
    // Dados do perfil
    full_name?: string;
    username?: string;
    date_of_birth?: string;
    school_year?: string;
    is_minor?: boolean;
    // Dados do responsável
    guardian?: {
      full_name: string;
      email: string;
      phone: string;
      cpf?: string;
      relation_to_student: string;
    };
  };
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ isOpen, onClose, user }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const [showCPF, setShowCPF] = React.useState(false);
  const [decryptedCPF, setDecryptedCPF] = React.useState<string | null>(null);
  const [cpfLoading, setCpfLoading] = React.useState(false);
  const [accessReason, setAccessReason] = React.useState('');

  const handleRevealCPF = async () => {
    if (!showCPF) {
      try {
        if (!accessReason.trim()) {
          toast({ title: 'Motivo obrigatório', description: 'Informe o motivo do acesso antes de revelar o CPF.' });
          return;
        }
        setCpfLoading(true);
        const { data, error } = await supabase.rpc('get_guardian_by_user', {
          target_user_id: user.user_id,
          access_reason: accessReason.trim(),
        });
        if (error) throw error;
        if (data && Array.isArray(data) && data.length > 0) {
          setDecryptedCPF(data[0].cpf as string);
          setShowCPF(true);
        } else {
          toast({ title: 'CPF indisponível', description: 'Nenhum dado encontrado.' });
        }
      } catch (err) {
        console.error('Erro ao obter CPF descriptografado:', err);
        toast({ title: 'Erro ao carregar CPF', description: 'Verifique suas permissões.' });
      } finally {
        setCpfLoading(false);
      }
    } else {
      setShowCPF(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Detalhes do Usuário
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
                <p className="text-lg font-semibold">{user.full_name || 'Não informado'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome de Usuário</label>
                <p className="text-sm text-foreground">{user.username || 'Não definido'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Data de Nascimento</label>
                <p className="text-sm text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {user.date_of_birth ? `${formatDate(user.date_of_birth)} (${getAge(user.date_of_birth)} anos)` : 'Não informado'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Escolaridade</label>
                <p className="text-sm text-foreground flex items-center gap-2">
                  <School className="h-4 w-4" />
                  {user.school_year || 'Não informado'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="flex gap-2">
                  <Badge variant={user.is_admin ? 'default' : 'secondary'}>
                    {user.is_admin ? 'Administrador' : 'Usuário'}
                  </Badge>
                  {user.is_minor && (
                    <Badge variant="outline">Menor de Idade</Badge>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Membro desde</label>
                <p className="text-sm text-foreground">{formatDate(user.created_at)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Responsável (se aplicável) */}
          {user.is_minor && user.guardian && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Responsável Legal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome do Responsável</label>
                  <p className="text-lg font-semibold">{user.guardian.full_name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Relação</label>
                  <p className="text-sm text-foreground">{user.guardian.relation_to_student}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm text-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user.guardian.email}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                  <p className="text-sm text-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {user.guardian.phone}
                  </p>
                </div>

                {(
                  user.guardian.cpf !== undefined || user.guardian.cpf === undefined
                ) && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">CPF</label>
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-foreground">
                        {showCPF ? (decryptedCPF ? formatCPF(decryptedCPF) : '—') : '***.***.***-**'}
                      </p>
                      {showCPF ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCPF(false)}
                          disabled={cpfLoading}
                        >
                          Ocultar
                        </Button>
                      ) : (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" disabled={cpfLoading}>
                              {cpfLoading ? (
                                <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Carregando</span>
                              ) : 'Revelar'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revelar CPF do responsável?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação será registrada na auditoria de acessos. Revele apenas quando necessário.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-2 mt-2">
                              <label className="text-sm font-medium text-foreground/80">Motivo do acesso</label>
                              <Input
                                placeholder="Ex.: Verificação de identidade para suporte"
                                value={accessReason}
                                onChange={(e) => setAccessReason(e.target.value)}
                                disabled={cpfLoading}
                              />
                              <p className="text-xs text-muted-foreground">Obrigatório. Será salvo no registro de auditoria.</p>
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={cpfLoading}>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={handleRevealCPF} disabled={cpfLoading || !accessReason.trim()}>
                                {cpfLoading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processando</span> : 'Confirmar'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          )}

          {/* Estatísticas de Uso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Plano e Uso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Plano Atual</label>
                <Badge variant="outline" className="ml-2 capitalize">
                  {user.plano}
                </Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Uploads</label>
                  <p className="text-2xl font-bold text-primary">{user.uploads_realizados}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Flashcards</label>
                  <p className="text-2xl font-bold text-green-600">{user.flashcards_gerados}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Quizzes</label>
                  <p className="text-2xl font-bold text-primary">{user.quizzes_realizados}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Armazenamento</label>
                  <p className="text-2xl font-bold text-orange-600">{user.storage_mb.toFixed(1)} MB</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">ID do Usuário</label>
                <p className="text-xs text-muted-foreground font-mono break-all">{user.user_id}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Última Atividade</label>
                <p className="text-sm text-foreground">Em desenvolvimento</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">IP de Registro</label>
                <p className="text-sm text-foreground">Em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
