import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UploadDebugInfoProps {
  isVisible?: boolean;
}

export const UploadDebugInfo = ({ isVisible = false }: UploadDebugInfoProps) => {
  const [showDebug, setShowDebug] = useState(isVisible);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      results: {}
    };

    try {
      // Test authentication
      console.log('🔍 Testing authentication...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      diagnostics.results.auth = {
        success: !authError && !!user,
        error: authError?.message,
        userId: user?.id
      };

      // Test storage bucket access
      console.log('🔍 Testing storage bucket...');
      try {
        const { data: { publicUrl } } = supabase.storage
          .from('study-images')
          .getPublicUrl('test-diagnostic');
        diagnostics.results.storage = {
          success: publicUrl.includes('study-images'),
          publicUrl: publicUrl.substring(0, 50) + '...'
        };
      } catch (storageError: any) {
        diagnostics.results.storage = {
          success: false,
          error: storageError.message
        };
      }

      // Test OCR function availability
      console.log('🔍 Testing OCR function...');
      try {
        const { error: ocrError } = await supabase.functions
          .invoke('extract-text-from-image', {
            body: { test: true }
          });
        
        diagnostics.results.ocr = {
          success: !ocrError || !ocrError.message.includes('not found'),
          error: ocrError?.message,
          available: !ocrError?.message.includes('not found')
        };
      } catch (ocrError: any) {
        diagnostics.results.ocr = {
          success: false,
          error: ocrError.message,
          available: false
        };
      }

      // Test database connectivity
      console.log('🔍 Testing database...');
      try {
        const { data, error: dbError } = await supabase
          .from('uploads')
          .select('id')
          .limit(1);
        
        diagnostics.results.database = {
          success: !dbError,
          error: dbError?.message,
          accessible: !dbError
        };
      } catch (dbError: any) {
        diagnostics.results.database = {
          success: false,
          error: dbError.message
        };
      }

      console.log('📊 Diagnostics completed:', diagnostics);
      setDebugInfo(diagnostics);

    } catch (error: any) {
      console.error('❌ Diagnostics failed:', error);
      setDebugInfo({
        timestamp: new Date().toISOString(),
        error: error.message,
        results: {}
      });
    }

    setLoading(false);
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  if (!showDebug) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDebug(true)}
        className="mt-2"
      >
        <Eye className="h-4 w-4 mr-2" />
        Mostrar Diagnósticos
      </Button>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Diagnósticos do Sistema
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDebug(false)}
          >
            <EyeOff className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={runDiagnostics}
          disabled={loading}
          size="sm"
        >
          {loading ? 'Executando...' : 'Executar Diagnósticos'}
        </Button>

        {debugInfo && (
          <div className="space-y-2 text-xs">
            <div className="font-mono text-xs opacity-60">
              {debugInfo.timestamp}
            </div>
            
            {debugInfo.error ? (
              <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700">
                Erro geral: {debugInfo.error}
              </div>
            ) : (
              <div className="space-y-2">
                {/* Authentication Status */}
                <div className="flex items-center gap-2 p-2 border rounded">
                  {getStatusIcon(debugInfo.results.auth?.success)}
                  <span className="font-medium">Autenticação:</span>
                  <span className={debugInfo.results.auth?.success ? 'text-green-600' : 'text-red-600'}>
                    {debugInfo.results.auth?.success ? 'OK' : debugInfo.results.auth?.error || 'Falha'}
                  </span>
                  {debugInfo.results.auth?.userId && (
                    <span className="text-xs opacity-60">({debugInfo.results.auth.userId.substring(0, 8)}...)</span>
                  )}
                </div>

                {/* Storage Status */}
                <div className="flex items-center gap-2 p-2 border rounded">
                  {getStatusIcon(debugInfo.results.storage?.success)}
                  <span className="font-medium">Storage:</span>
                  <span className={debugInfo.results.storage?.success ? 'text-green-600' : 'text-red-600'}>
                    {debugInfo.results.storage?.success ? 'OK' : debugInfo.results.storage?.error || 'Falha'}
                  </span>
                </div>

                {/* OCR Function Status */}
                <div className="flex items-center gap-2 p-2 border rounded">
                  {getStatusIcon(debugInfo.results.ocr?.available)}
                  <span className="font-medium">Função OCR:</span>
                  <span className={debugInfo.results.ocr?.available ? 'text-green-600' : 'text-red-600'}>
                    {debugInfo.results.ocr?.available ? 'Disponível' : 'Indisponível'}
                  </span>
                  {debugInfo.results.ocr?.error && (
                    <span className="text-xs opacity-60">({debugInfo.results.ocr.error.substring(0, 30)}...)</span>
                  )}
                </div>

                {/* Database Status */}
                <div className="flex items-center gap-2 p-2 border rounded">
                  {getStatusIcon(debugInfo.results.database?.success)}
                  <span className="font-medium">Database:</span>
                  <span className={debugInfo.results.database?.success ? 'text-green-600' : 'text-red-600'}>
                    {debugInfo.results.database?.success ? 'OK' : debugInfo.results.database?.error || 'Falha'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};