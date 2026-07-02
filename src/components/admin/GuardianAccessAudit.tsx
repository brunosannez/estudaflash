
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface AuditRow {
  id: string;
  accessor_user_id: string;
  target_user_id: string;
  accessed_at: string;
  accessed_fields: string[];
  reason: string | null;
}

const GuardianAccessAudit: React.FC = () => {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('guardian_access_audit')
          .select('*')
          .order('accessed_at', { ascending: false })
          .limit(200);
        if (error) throw error;
        setRows((data as AuditRow[]) || []);
      } catch (err) {
        console.error('Erro ao carregar auditoria:', err);
        toast({ title: 'Falha ao carregar auditoria', description: 'Verifique permissões de admin.' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Auditoria de Acesso a Dados Sensíveis</CardTitle>
        </div>
        <Badge variant="outline">CPF protegido</Badge>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Carregando...
          </div>
        ) : rows.length === 0 ? (
          <p className="text-muted-foreground">Nenhum acesso registrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Quem Acessou (user_id)</TableHead>
                  <TableHead>Alvo (user_id)</TableHead>
                  <TableHead>Campos</TableHead>
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{new Date(r.accessed_at).toLocaleString('pt-BR')}</TableCell>
                    <TableCell className="font-mono text-xs">{r.accessor_user_id}</TableCell>
                    <TableCell className="font-mono text-xs">{r.target_user_id}</TableCell>
                    <TableCell>
                      {r.accessed_fields?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {r.accessed_fields.map((f, i) => (
                            <Badge key={i} variant="secondary">{f}</Badge>
                          ))}
                        </div>
                      ) : '—'}
                    </TableCell>
                    <TableCell>{r.reason || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GuardianAccessAudit;
