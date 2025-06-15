
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SignupHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/home')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Voltar</span>
      </Button>
      
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
          <span className="text-lg">🎓</span>
        </div>
        <h1 className="text-xl font-bold text-gray-700">EstudoFácil AI</h1>
      </div>
    </div>
  );
};

export default SignupHeader;
