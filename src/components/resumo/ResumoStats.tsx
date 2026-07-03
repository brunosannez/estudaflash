
import { Card, CardContent } from '@/components/ui/card';
import { Clock, BookOpen, Target } from 'lucide-react';

interface ResumoStatsProps {
  estimatedReadTime: number;
  contentLength: number;
  createdDate: string;
}

const ResumoStats = ({ estimatedReadTime, contentLength, createdDate }: ResumoStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card className="bg-primary text-primary-foreground border-0 rounded-2xl">
        <CardContent className="p-4 flex items-center gap-3">
          <Clock className="h-8 w-8 text-brand-orange" />
          <div>
            <p className="text-primary-foreground/70 text-sm">Tempo de Leitura</p>
            <p className="text-xl font-bold">{estimatedReadTime} min</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-accent text-accent-foreground border-0 rounded-2xl">
        <CardContent className="p-4 flex items-center gap-3">
          <BookOpen className="h-8 w-8" />
          <div>
            <p className="text-accent-foreground/70 text-sm">Caracteres</p>
            <p className="text-xl font-bold">{contentLength.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary text-primary-foreground border-0 rounded-2xl">
        <CardContent className="p-4 flex items-center gap-3">
          <Target className="h-8 w-8 text-brand-orange" />
          <div>
            <p className="text-primary-foreground/70 text-sm">Criado em</p>
            <p className="text-lg font-bold">{createdDate.split(' ')[0]}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumoStats;
