
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
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
        <CardContent className="p-4 flex items-center gap-3">
          <Clock className="h-8 w-8" />
          <div>
            <p className="text-blue-100 text-sm">Tempo de Leitura</p>
            <p className="text-xl font-bold">{estimatedReadTime} min</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
        <CardContent className="p-4 flex items-center gap-3">
          <BookOpen className="h-8 w-8" />
          <div>
            <p className="text-green-100 text-sm">Caracteres</p>
            <p className="text-xl font-bold">{contentLength.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
        <CardContent className="p-4 flex items-center gap-3">
          <Target className="h-8 w-8" />
          <div>
            <p className="text-purple-100 text-sm">Criado em</p>
            <p className="text-lg font-bold">{createdDate.split(' ')[0]}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumoStats;
