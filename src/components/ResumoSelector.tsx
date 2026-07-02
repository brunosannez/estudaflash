
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, Calendar, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Resumo {
  id: string;
  resumo_gerado: string;
  data_criacao: string;
  uploads: {
    id: string;
    texto_extraido: string;
  };
}

interface ResumoSelectorProps {
  onSelectResumo: (resumo: Resumo) => void;
  title: string;
  description: string;
  actionText: string;
}

const ResumoSelector = ({ onSelectResumo, title, description, actionText }: ResumoSelectorProps) => {
  const [resumos, setResumos] = useState<Resumo[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchResumos();
  }, []);

  const fetchResumos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('resumos')
        .select(`
          id,
          resumo_gerado,
          data_criacao,
          uploads!inner(
            id,
            texto_extraido,
            user_id
          )
        `)
        .eq('uploads.user_id', user.id)
        .order('data_criacao', { ascending: false })
        .limit(10);

      if (error) throw error;

      setResumos(data || []);
    } catch (error) {
      console.error('Erro ao buscar resumos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os resumos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {resumos.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground/70 mb-4" />
            <h3 className="text-xl font-semibold text-foreground/80 mb-2">Nenhum resumo encontrado</h3>
            <p className="text-muted-foreground mb-6">
              Você ainda não possui resumos criados. Faça upload de uma imagem para começar!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resumos.map((resumo) => (
            <Card key={resumo.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">
                    {resumo.uploads.texto_extraido?.slice(0, 50) || 'Resumo'}...
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground/70 flex-shrink-0 ml-2" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDate(resumo.data_criacao)}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-foreground/80 line-clamp-3 mb-4">
                  {resumo.resumo_gerado.slice(0, 150)}...
                </p>
                <Button 
                  onClick={() => onSelectResumo(resumo)}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {actionText}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumoSelector;
