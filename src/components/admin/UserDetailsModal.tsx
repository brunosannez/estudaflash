
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
import { User, Calendar, School, Shield, Mail, Phone, UserCheck } from 'lucide-react';

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
                <label className="text-sm font-medium text-gray-600">Nome Completo</label>
                <p className="text-lg font-semibold">{user.full_name || 'Não informado'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Nome de Usuário</label>
                <p className="text-sm text-gray-800">{user.username || 'Não definido'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-sm text-gray-800 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Data de Nascimento</label>
                <p className="text-sm text-gray-800 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {user.date_of_birth ? `${formatDate(user.date_of_birth)} (${getAge(user.date_of_birth)} anos)` : 'Não informado'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Escolaridade</label>
                <p className="text-sm text-gray-800 flex items-center gap-2">
                  <School className="h-4 w-4" />
                  {user.school_year || 'Não informado'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
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
                <label className="text-sm font-medium text-gray-600">Membro desde</label>
                <p className="text-sm text-gray-800">{formatDate(user.created_at)}</p>
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
                  <label className="text-sm font-medium text-gray-600">Nome do Responsável</label>
                  <p className="text-lg font-semibold">{user.guardian.full_name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Relação</label>
                  <p className="text-sm text-gray-800">{user.guardian.relation_to_student}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-sm text-gray-800 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user.guardian.email}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Telefone</label>
                  <p className="text-sm text-gray-800 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {user.guardian.phone}
                  </p>
                </div>

                {user.guardian.cpf && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">CPF</label>
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-gray-800">
                        {showCPF ? user.guardian.cpf : '***.***.***-**'}
                      </p>
                      <Button variant="outline" size="sm" onClick={() => setShowCPF((v) => !v)}>
                        {showCPF ? 'Ocultar' : 'Revelar'}
                      </Button>
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
                <label className="text-sm font-medium text-gray-600">Plano Atual</label>
                <Badge variant="outline" className="ml-2 capitalize">
                  {user.plano}
                </Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Uploads</label>
                  <p className="text-2xl font-bold text-blue-600">{user.uploads_realizados}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Flashcards</label>
                  <p className="text-2xl font-bold text-green-600">{user.flashcards_gerados}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Quizzes</label>
                  <p className="text-2xl font-bold text-purple-600">{user.quizzes_realizados}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Armazenamento</label>
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
                <label className="text-sm font-medium text-gray-600">ID do Usuário</label>
                <p className="text-xs text-gray-600 font-mono break-all">{user.user_id}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Última Atividade</label>
                <p className="text-sm text-gray-800">Em desenvolvimento</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">IP de Registro</label>
                <p className="text-sm text-gray-800">Em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
