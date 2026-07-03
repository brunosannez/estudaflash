
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMindMap, MindMap as MindMapType } from '@/hooks/useMindMap';
import MindMapViewer from '@/components/MindMapViewer';
import PageLayout from '@/components/navigation/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

const MindMap = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMindMapById } = useMindMap();
  const [mindMap, setMindMap] = useState<MindMapType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('ID do mapa mental não fornecido');
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchMindMap = async () => {
      try {
        setLoading(true);
        console.log('🧠 Carregando mapa mental com ID:', id);
        const data = await getMindMapById(id);
        
        if (isMounted) {
          if (data) {
            console.log('✅ Mapa mental carregado:', data);
            setMindMap(data);
            setError(null);
          } else {
            console.warn('⚠️ Mapa mental não encontrado');
            setError('Mapa mental não encontrado');
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('❌ Erro ao carregar mapa mental:', err);
          setError('Erro ao carregar mapa mental');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMindMap();

    return () => {
      isMounted = false;
    };
  }, [id]); // APENAS 'id' como dependência

  const handleBack = () => {
    if (mindMap?.resumo_id) {
      navigate(`/resumo/${mindMap.resumo_id}`);
    } else {
      navigate('/my-summaries');
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-96">
            <CardContent className="py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Carregando mapa mental...</p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (error || !mindMap) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-96">
            <CardContent className="py-8 text-center">
              <p className="text-destructive mb-4">{error || 'Mapa mental não encontrado'}</p>
              <Button onClick={() => navigate('/my-summaries')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos Resumos
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <MindMapViewer 
          mindMapData={mindMap.content} 
          onBack={handleBack}
        />
      </div>
    </PageLayout>
  );
};

export default MindMap;
