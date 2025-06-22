
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import PageLayout from '@/components/navigation/PageLayout';

interface ResumoErrorStateProps {
  error: string | null;
}

const ResumoErrorState = ({ error }: ResumoErrorStateProps) => {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-96">
          <CardContent className="py-8 text-center">
            <p className="text-red-600 mb-4">{error || 'Resumo não encontrado'}</p>
            <Button onClick={() => navigate('/my-summaries')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Resumos
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default ResumoErrorState;
