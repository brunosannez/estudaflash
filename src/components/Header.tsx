
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
  ChevronDown,
  Sparkles
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { designColors } from '@/utils/designSystem';

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
    <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b-4 border-cyan-300 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link 
            to={user ? "/" : "/home"} 
            className={`flex items-center gap-3 text-3xl font-bold text-gray-700 ${designColors.animations.buttonHover}`}
          >
            <Sparkles className="h-8 w-8 text-cyan-500 animate-pulse" />
            🎓 StudyAI
            <Sparkles className="h-8 w-8 text-purple-500 animate-pulse" />
          </Link>
          
          {user && (
            <nav className="hidden md:flex items-center space-x-4">
              <Link 
                to="/" 
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 font-semibold ${
                  isActive('/') 
                    ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-cyan-100 hover:to-purple-100 hover:text-gray-700 hover:scale-105'
                }`}
              >
                <Home className="h-5 w-5" />
                🏠 Início
              </Link>
              
              <Link 
                to="/meus-resumos" 
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 font-semibold ${
                  isActive('/meus-resumos') 
                    ? 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-cyan-100 hover:to-green-100 hover:text-gray-700 hover:scale-105'
                }`}
              >
                <BookOpen className="h-5 w-5" />
                📚 Resumos
              </Link>
              
              <Link 
                to="/meus-flashcards" 
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 font-semibold ${
                  isActive('/meus-flashcards') 
                    ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-green-100 hover:to-cyan-100 hover:text-gray-700 hover:scale-105'
                }`}
              >
                <Brain className="h-5 w-5" />
                🧠 Flashcards
              </Link>
              
              <Link 
                to="/quiz-history" 
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 font-semibold ${
                  isActive('/quiz-history') 
                    ? 'bg-gradient-to-r from-purple-400 to-cyan-500 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-purple-100 hover:to-cyan-100 hover:text-gray-700 hover:scale-105'
                }`}
              >
                <History className="h-5 w-5" />
                📊 Histórico
              </Link>
              
              <Link 
                to="/progresso" 
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 font-semibold ${
                  isActive('/progresso') 
                    ? 'bg-gradient-to-r from-green-400 to-purple-500 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-green-100 hover:to-purple-100 hover:text-gray-700 hover:scale-105'
                }`}
              >
                <Trophy className="h-5 w-5" />
                🏆 Progresso
              </Link>
            </nav>
          )}

          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className={`flex items-center gap-2 bg-white/90 border-2 border-cyan-300 text-gray-700 font-semibold rounded-xl shadow-lg ${designColors.animations.buttonHover}`}>
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline">
                      👋 {user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-sm border-2 border-cyan-200 rounded-xl shadow-xl">
                  <div className="px-3 py-2 text-sm font-medium text-gray-700">
                    ✨ {user.email}
                  </div>
                  <DropdownMenuSeparator />
                  
                  {/* Menu mobile */}
                  <div className="md:hidden">
                    <DropdownMenuItem onClick={() => navigate('/')} className="hover:bg-purple-50 rounded-lg mx-1">
                      <Home className="h-4 w-4 mr-2" />
                      🏠 Início
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/meus-resumos')} className="hover:bg-cyan-50 rounded-lg mx-1">
                      <BookOpen className="h-4 w-4 mr-2" />
                      📚 Resumos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/meus-flashcards')} className="hover:bg-green-50 rounded-lg mx-1">
                      <Brain className="h-4 w-4 mr-2" />
                      🧠 Flashcards
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/quiz-history')} className="hover:bg-purple-50 rounded-lg mx-1">
                      <History className="h-4 w-4 mr-2" />
                      📊 Histórico
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/progresso')} className="hover:bg-green-50 rounded-lg mx-1">
                      <Trophy className="h-4 w-4 mr-2" />
                      🏆 Progresso
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </div>
                  
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:bg-red-50 rounded-lg mx-1 font-semibold">
                    <LogOut className="h-4 w-4 mr-2" />
                    👋 Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/home')}
                  className={`bg-gradient-to-r from-purple-400 to-purple-500 text-white border-0 font-bold rounded-xl shadow-lg ${designColors.animations.buttonHover}`}
                >
                  ✨ Entrar
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
