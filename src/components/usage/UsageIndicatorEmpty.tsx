
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertCircle } from 'lucide-react';
import StorageIndicator from './StorageIndicator';

interface UsageIndicatorEmptyProps {
  onManualSync: () => Promise<void>;
  syncing: boolean;
  hasInitialized: boolean;
}

const UsageIndicatorEmpty = ({ onManualSync, syncing, hasInitialized }: UsageIndicatorEmptyProps) => {
  if (hasInitialized) {
    return (
      <div className="space-y-4">
        <Card className="w-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Uso do Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Dados não sincronizados. Clique para atualizar.
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={onManualSync}
              disabled={syncing}
              variant="outline"
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
        <StorageIndicator />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-sm">Uso do Plano</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-4">Carregando dados...</p>
            <Button 
              onClick={onManualSync}
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
      <StorageIndicator />
    </div>
  );
};

export default UsageIndicatorEmpty;
