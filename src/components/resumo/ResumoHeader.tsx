
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ResumoHeaderProps {
  onBack: () => void;
}

const ResumoHeader = ({ onBack }: ResumoHeaderProps) => {
  return (
    <div className="flex items-center gap-4">
      <Button 
        variant="outline" 
        onClick={onBack}
        className="flex items-center gap-2 hover:bg-blue-50 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>
      <div>
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <FileText className="h-6 w-6 text-white" />
          </div>
          Resumo Didático
        </h1>
        <p className="text-gray-600 mt-1">Seu material de estudo personalizado</p>
      </div>
    </div>
  );
};

export default ResumoHeader;
