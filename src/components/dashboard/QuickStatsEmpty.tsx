
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trophy, RefreshCw, AlertCircle } from 'lucide-react';

interface QuickStatsEmptyProps {
  onRefresh: () => Promise<void>;
  syncing: boolean;
  hasInitialized: boolean;
}

const QuickStatsEmpty = ({ onRefresh, syncing, hasInitialized }: QuickStatsEmptyProps) => {
  if (hasInitialized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Estatísticas Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Dados ainda não sincronizados. Clique em "Sincronizar" para atualizar.
            </AlertDescription>
          </Alert>
          
          <div className="text-center py-4">
            <div className="mb-4">
              <Trophy className="h-12 w-12 mx-auto text-gray-300" />
            </div>
            <p className="text-sm font-medium mb-2">Bem-vindo!</p>
            <p className="text-xs text-muted-foreground mb-4">Suas estatísticas aparecerão aqui</p>
            
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
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Estatísticas Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <div className="mb-4">
            <Trophy className="h-12 w-12 mx-auto text-gray-300" />
          </div>
          <p className="text-sm font-medium">Carregando dados...</p>
          <Button 
            onClick={onRefresh}
            disabled={syncing}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            {syncing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Sincronizando...
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
};

export default QuickStatsEmpty;
