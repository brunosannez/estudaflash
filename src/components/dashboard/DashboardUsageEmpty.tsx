
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface DashboardUsageEmptyProps {
  onRefresh: () => Promise<void>;
  syncing: boolean;
  hasInitialized: boolean;
}

const DashboardUsageEmpty = ({ onRefresh, syncing, hasInitialized }: DashboardUsageEmptyProps) => {
  if (!hasInitialized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas de Uso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-4">Carregando dados...</p>
            <Button 
              onClick={onRefresh}
              disabled={syncing}
              variant="outline"
              size="sm"
            >
              {syncing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Carregando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas de Uso</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Dados não sincronizados. Clique para atualizar.
          </AlertDescription>
        </Alert>
        
        <Button 
          onClick={onRefresh}
          disabled={syncing}
          variant="default"
          size="sm"
          className="w-full"
        >
          {syncing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sincronizar Dados
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DashboardUsageEmpty;
