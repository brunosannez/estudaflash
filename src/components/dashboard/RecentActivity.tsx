import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronRight, Loader2 } from 'lucide-react';

interface ActivityItem {
  id: string;
  title: string;
  date: string;
}

const RecentActivity = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadRecent = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('resumos')
          .select('id, custom_name, data_criacao, uploads!inner(user_id)')
          .eq('uploads.user_id', user.id)
          .order('data_criacao', { ascending: false })
          .limit(5);

        if (error) throw error;

        if (isMounted && data) {
          setItems(
            data.map((r: any) => ({
              id: r.id,
              title: r.custom_name || 'Resumo sem título',
              date: r.data_criacao,
            }))
          );
        }
      } catch (error) {
        console.error('Erro ao carregar atividade recente:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadRecent();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - date.getTime()) / 86400000);
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <Card className="bg-background/90 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">📝 Atividade Recente</CardTitle>
        <CardDescription>O que você fez ultimamente</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-4 space-y-3">
            <p className="text-muted-foreground text-sm">
              Você ainda não criou nenhum resumo. Envie suas anotações e deixe a IA trabalhar!
            </p>
            <Button size="sm" onClick={() => navigate('/upload')}>
              Criar meu primeiro resumo
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(`/resumo/${item.id}`)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/60 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-primary"
              onClick={() => navigate('/my-summaries')}
            >
              Ver todos os resumos
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
