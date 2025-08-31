import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, Eye, Clock, Users, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsAdmin } from '@/hooks/useIsAdmin';

interface SecurityAuditLog {
  id: string;
  user_id: string;
  action_type: string;
  resource_type: string;
  resource_id: string | null;
  ip_address: unknown;
  user_agent: unknown;
  success: boolean;
  details: any;
  created_at: string;
}

interface RateLimitEntry {
  id: string;
  user_id: string;
  action_type: string;
  ip_address: unknown;
  request_count: number;
  window_start: string;
  created_at: string;
}

export const SecurityDashboard: React.FC = () => {
  const { isAdmin, loading } = useIsAdmin();
  const { toast } = useToast();
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [rateLimitData, setRateLimitData] = useState<RateLimitEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [securityStats, setSecurityStats] = useState({
    totalAuditEvents: 0,
    suspiciousActivity: 0,
    rateLimitViolations: 0,
    uniqueUsers: 0
  });

  useEffect(() => {
    if (!loading && isAdmin) {
      fetchSecurityData();
    }
  }, [loading, isAdmin]);

  const fetchSecurityData = async () => {
    try {
      setLoadingLogs(true);

      // Fetch audit logs
      const { data: auditData, error: auditError } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (auditError) throw auditError;
      setAuditLogs(auditData || []);

      // Fetch rate limiting data
      const { data: rateLimitingData, error: rateLimitError } = await supabase
        .from('rate_limiting_enhanced')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (rateLimitError) throw rateLimitError;
      setRateLimitData(rateLimitingData || []);

      // Calculate security stats
      const totalEvents = auditData?.length || 0;
      const suspiciousCount = auditData?.filter(log => 
        !log.success || 
        log.action_type.includes('failed') ||
        (typeof log.details === 'object' && log.details && 'suspicious' in log.details && log.details.suspicious)
      ).length || 0;
      
      const rateLimitViolations = rateLimitingData?.filter(entry => 
        entry.request_count > 10
      ).length || 0;

      const uniqueUsers = new Set(auditData?.map(log => log.user_id)).size;

      setSecurityStats({
        totalAuditEvents: totalEvents,
        suspiciousActivity: suspiciousCount,
        rateLimitViolations,
        uniqueUsers
      });

    } catch (error: any) {
      console.error('Error fetching security data:', error);
      toast({
        title: "Erro ao carregar dados de segurança",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoadingLogs(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse">Carregando dashboard de segurança...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Acesso negado. Apenas administradores podem visualizar o dashboard de segurança.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Dashboard de Segurança
        </h2>
        <Button onClick={fetchSecurityData} variant="outline">
          <Clock className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Security Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Eventos de Auditoria</p>
                <p className="text-2xl font-bold">{securityStats.totalAuditEvents}</p>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atividades Suspeitas</p>
                <p className="text-2xl font-bold text-destructive">{securityStats.suspiciousActivity}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Violações de Rate Limit</p>
                <p className="text-2xl font-bold text-warning">{securityStats.rateLimitViolations}</p>
              </div>
              <Lock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuários Únicos</p>
                <p className="text-2xl font-bold">{securityStats.uniqueUsers}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="audit-logs" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="audit-logs">Logs de Auditoria</TabsTrigger>
          <TabsTrigger value="rate-limits">Rate Limiting</TabsTrigger>
        </TabsList>

        <TabsContent value="audit-logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Auditoria Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingLogs ? (
                <div className="text-center py-8">Carregando logs...</div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum evento de auditoria encontrado
                </div>
              ) : (
                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <div 
                      key={log.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={log.success ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {log.action_type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {log.resource_type}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          IP: {(log.ip_address as string) || 'N/A'} | User: {log.user_id?.slice(0, 8)}...
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        {formatDate(log.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rate-limits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rate Limiting Recente</CardTitle>
            </CardHeader>
            <CardContent>
              {rateLimitData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma violação de rate limit encontrada
                </div>
              ) : (
                <div className="space-y-2">
                  {rateLimitData.map((entry) => (
                    <div 
                      key={entry.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={entry.request_count > 10 ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {entry.action_type}
                          </Badge>
                          <span className="text-sm">
                            {entry.request_count} requests
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          IP: {(entry.ip_address as string) || 'N/A'} | User: {entry.user_id?.slice(0, 8)}...
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        {formatDate(entry.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};