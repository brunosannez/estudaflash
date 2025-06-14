
import { Brain, User, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8" />
          <h1 className="text-2xl font-bold">EstudoFácil AI</h1>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#dashboard" className="hover:text-blue-200 transition-colors">Dashboard</a>
          <a href="#upload" className="hover:text-blue-200 transition-colors">Upload</a>
          <a href="#flashcards" className="hover:text-blue-200 transition-colors">Flashcards</a>
          <a href="#quiz" className="hover:text-blue-200 transition-colors">Quiz</a>
        </nav>

        <div className="flex items-center space-x-3">
          <Button variant="ghost" className="text-white hover:bg-white/20">
            <BarChart3 className="h-5 w-5 mr-2" />
            Progresso
          </Button>
          <Button variant="ghost" className="text-white hover:bg-white/20">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
