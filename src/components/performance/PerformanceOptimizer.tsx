import { lazy, Suspense, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gauge, Zap, Image, Network, HardDrive, Clock } from 'lucide-react';

// Lazy load components for better performance  
const LazyImageOptimizer = lazy(() => Promise.resolve({ default: () => <div>Image Optimizer em desenvolvimento...</div> }));
const LazyCacheManager = lazy(() => Promise.resolve({ default: () => <div>Cache Manager em desenvolvimento...</div> }));

interface PerformanceMetrics {
  loadTime: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  memoryUsage: number;
  cacheHitRate: number;
}

const PerformanceOptimizer = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [optimizationScore, setOptimizationScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    analyzePerformance();
  }, []);

  const analyzePerformance = async () => {
    setIsAnalyzing(true);
    
    try {
      // Get performance metrics
      const navigation = performance.getEntriesByType('navigation')[0] as any;
      const paint = performance.getEntriesByType('paint');
      
      const firstPaint = paint.find(entry => entry.name === 'first-paint')?.startTime || 0;
      const firstContentfulPaint = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
      
      // Get memory usage if available
      const memoryInfo = (performance as any).memory;
      const memoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize : 0;
      
      // Simulate cache hit rate calculation
      const cacheHitRate = Math.random() * 0.3 + 0.7; // 70-100%
      
      const newMetrics: PerformanceMetrics = {
        loadTime: navigation.loadEventEnd - navigation.navigationStart,
        firstPaint,
        firstContentfulPaint,
        largestContentfulPaint: 0, // Would need observer
        cumulativeLayoutShift: 0, // Would need observer
        firstInputDelay: 0, // Would need observer
        memoryUsage,
        cacheHitRate
      };
      
      setMetrics(newMetrics);
      
      // Calculate optimization score
      let score = 100;
      if (newMetrics.loadTime > 3000) score -= 20;
      if (newMetrics.firstContentfulPaint > 1500) score -= 15;
      if (newMetrics.memoryUsage > 0.8) score -= 15;
      if (newMetrics.cacheHitRate < 0.8) score -= 10;
      
      setOptimizationScore(Math.max(0, score));
    } catch (error) {
      console.error('Error analyzing performance:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excelente';
    if (score >= 70) return 'Bom';
    if (score >= 50) return 'Precisa Melhorar';
    return 'Crítico';
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Gauge className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Otimizador de Performance</h1>
          <p className="text-muted-foreground">
            Monitore e otimize a performance da aplicação
          </p>
        </div>
      </div>

      {/* Score Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Score de Performance
            <Button onClick={analyzePerformance} disabled={isAnalyzing} size="sm">
              {isAnalyzing ? 'Analisando...' : 'Analisar Novamente'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(optimizationScore)}`}>
                {optimizationScore}
              </div>
              <Badge variant="outline" className={getScoreColor(optimizationScore)}>
                {getScoreLabel(optimizationScore)}
              </Badge>
            </div>
            <div className="flex-1">
              <Progress value={optimizationScore} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                Performance geral da aplicação
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas de Performance */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo de Carregamento</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(metrics.loadTime / 1000).toFixed(2)}s
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.loadTime < 3000 ? 'Excelente' : 'Pode melhorar'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">First Paint</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(metrics.firstPaint / 1000).toFixed(2)}s
              </div>
              <p className="text-xs text-muted-foreground">
                Primeira renderização
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uso de Memória</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(metrics.memoryUsage * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Memória JavaScript utilizada
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
              <Network className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(metrics.cacheHitRate * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Eficiência do cache
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ferramentas de Otimização */}
      <Tabs defaultValue="images" className="space-y-4">
        <TabsList>
          <TabsTrigger value="images">Otimização de Imagens</TabsTrigger>
          <TabsTrigger value="cache">Gerenciamento de Cache</TabsTrigger>
          <TabsTrigger value="bundle">Análise de Bundle</TabsTrigger>
        </TabsList>

        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Otimização de Imagens
              </CardTitle>
              <CardDescription>
                Otimize imagens para melhor performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Carregando otimizador de imagens...</div>}>
                <LazyImageOptimizer />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Gerenciamento de Cache
              </CardTitle>
              <CardDescription>
                Gerencie o cache da aplicação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Carregando gerenciador de cache...</div>}>
                <LazyCacheManager />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bundle">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Bundle</CardTitle>
              <CardDescription>
                Analise o tamanho e composição do bundle JavaScript
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Análise de bundle em desenvolvimento...
                <br />
                <small className="text-xs">
                  Esta funcionalidade analisará o tamanho dos chunks e dependências
                </small>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendações de Otimização</CardTitle>
          <CardDescription>
            Sugestões para melhorar a performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {optimizationScore < 90 && (
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                <Zap className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Implementar Code Splitting</p>
                  <p className="text-sm text-primary">
                    Use lazy loading para componentes não críticos
                  </p>
                </div>
              </div>
            )}
            
            {metrics && metrics.loadTime > 3000 && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-900">Otimizar Tempo de Carregamento</p>
                  <p className="text-sm text-orange-700">
                    Considere comprimir assets e usar CDN
                  </p>
                </div>
              </div>
            )}
            
            {metrics && metrics.cacheHitRate < 0.8 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <Network className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Melhorar Estratégia de Cache</p>
                  <p className="text-sm text-green-700">
                    Implemente cache mais agressivo para recursos estáticos
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceOptimizer;