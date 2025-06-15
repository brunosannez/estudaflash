
import { Loader2 } from 'lucide-react';

const ProgressLoading = () => {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto" />
        <p className="text-lg font-semibold text-gray-600">
          Sincronizando progresso...
        </p>
        <div className="text-sm text-gray-500 max-w-md mx-auto">
          Estamos calculando seu progresso real baseado em todas as suas atividades na plataforma
        </div>
      </div>
    </div>
  );
};

export default ProgressLoading;
