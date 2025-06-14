
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  LogOut, 
  User, 
  BookOpen, 
  Brain, 
  Trophy,
  History,
  Home,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/home');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link 
            to={user ? "/" : "/home"} 
            className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:scale-105 transition-transform"
          >
            🎓 StudyAI
          </Link>
          
          {user && (
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                to="/" 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/') 
                    ? 'bg-purple-100 text-purple-700 font-semibold' 
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <Home className="h-4 w-4" />
                Início
              </Link>
              
              <Link 
                to="/meus-resumos" 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/meus-resumos') 
                    ? 'bg-purple-100 text-purple-700 font-semibold' 
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                Resumos
              </Link>
              
              <Link 
                to="/meus-flashcards" 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/meus-flashcards') 
                    ? 'bg-purple-100 text-purple-700 font-semibold' 
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <Brain className="h-4 w-4" />
                Flashcards
              </Link>
              
              <Link 
                to="/quiz-history" 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/quiz-history') 
                    ? 'bg-purple-100 text-purple-700 font-semibold' 
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <History className="h-4 w-4" />
                Histórico de Quizzes
              </Link>
              
              <Link 
                to="/progresso" 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/progresso') 
                    ? 'bg-purple-100 text-purple-700 font-semibold' 
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <Trophy className="h-4 w-4" />
                Progresso
              </Link>
            </nav>
          )}

          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {user.email}
                  </div>
                  <DropdownMenuSeparator />
                  
                  {/* Menu mobile */}
                  <div className="md:hidden">
                    <DropdownMenuItem onClick={() => navigate('/')}>
                      <Home className="h-4 w-4 mr-2" />
                      Início
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/meus-resumos')}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Resumos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/meus-flashcards')}>
                      <Brain className="h-4 w-4 mr-2" />
                      Flashcards
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/quiz-history')}>
                      <History className="h-4 w-4 mr-2" />
                      Histórico de Quizzes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/progresso')}>
                      <Trophy className="h-4 w-4 mr-2" />
                      Progresso
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </div>
                  
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => navigate('/home')}>
                  Entrar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
