import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Shield, KeyRound, RefreshCw, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

const AdminSecurity: React.FC = () => {
  const [activeVersion, setActiveVersion] = React.useState<number | null>(null);
  const [rotating, setRotating] = React.useState(false);

  const loadActiveVersion = React.useCallback(async () => {
    const { data, error } = await supabase.rpc('get_active_guardian_key_version');
    if (error) {
      console.error('Erro ao buscar versão ativa:', error);
      toast({ title: 'Erro', description: 'Não foi possível carregar a versão ativa da chave.' });
      return;
    }
    if (Array.isArray(data) && data.length > 0) {
      setActiveVersion(data[0].key_version ?? data[0] ?? null);
    } else if (typeof data === 'number') {
      setActiveVersion(data);
    } else {
      setActiveVersion(null);
    }
  }, []);

  React.useEffect(() => {
    loadActiveVersion();
  }, [loadActiveVersion]);

  const handleRotateKey = async () => {
    try {
      setRotating(true);
      const { data, error } = await supabase.functions.invoke('admin-rotate-guardian-key', {
        body: {},
      });
      if (error) throw error;
      toast({ title: 'Chave rotacionada', description: 'CPFs recriptografados com a nova chave.' });
      await loadActiveVersion();
    } catch (err) {
      console.error('Erro ao rotacionar chave:', err);
      toast({ title: 'Falha na rotação', description: 'Verifique permissões de administrador.' });
    } finally {
      setRotating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Segurança de Dados Sensíveis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <KeyRound className="h-5 w-5" />
              <div>
                <p className="text-sm text-gray-600">Versão ativa da chave de criptografia</p>
                <p className="text-lg font-semibold">{activeVersion ?? '—'}</p>
              </div>
            </div>
            <Button onClick={handleRotateKey} disabled={rotating}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {rotating ? 'Rotacionando...' : 'Rotacionar Chave'}
            </Button>
          </div>

          <Separator />

          <div className="flex items-start gap-3 text-sm text-gray-600">
            <Info className="h-4 w-4 mt-0.5" />
            <p>
              A rotação cria uma nova chave, desativa as anteriores e recriptografa todos os CPFs com a versão mais recente. O acesso ao CPF exige informar um motivo e é auditado automaticamente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSecurity;
