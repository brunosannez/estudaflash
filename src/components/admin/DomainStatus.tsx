
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, AlertCircle, CheckCircle } from 'lucide-react';

const DomainStatus = () => {
  const currentDomain = window.location.hostname;
  const isProduction = currentDomain === 'estudaflash.com' || currentDomain === 'www.estudaflash.com';
  const isStaging = currentDomain.includes('vercel.app');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Status do Domínio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Domínio Atual:</span>
          <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
            {currentDomain}
          </span>
        </div>

        {isProduction ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              ✅ Conectado ao domínio de produção estudaflash.com
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              ⚠️ Não está conectado ao domínio estudaflash.com
              <br />
              <strong>Para configurar:</strong>
              <br />
              1. Acesse o Supabase Dashboard
              <br />
              2. Vá em Authentication → URL Configuration
              <br />
              3. Adicione https://estudaflash.com nas Redirect URLs
              <br />
              4. Configure o Site URL para https://estudaflash.com
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Domínio de produção: estudaflash.com</p>
          <p>• Deploy/preview: *.vercel.app</p>
          <p>• Status: {isProduction ? 'Produção' : isStaging ? 'Preview (Vercel)' : 'Local'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DomainStatus;
