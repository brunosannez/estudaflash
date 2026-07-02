
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Zap, LogIn, UserPlus, LayoutDashboard } from 'lucide-react';

const HomeHeader = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  console.log('🧭 HomeHeader rendering - User:', !!user);

  const handleDashboardClick = () => {
    console.log('🎯 Navigating to dashboard');
    navigate('/', { replace: true });
  };

  return (
    <header className="relative z-20 bg-background/90 backdrop-blur-sm border-b border-purple-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <div className="absolute inset-0 bg-primary/10 animate-pulse rounded-xl"></div>
                <Zap className="h-6 w-6 text-white relative z-10" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-ping"></div>
            </div>
            <div className="relative">
              <span className="font-bold text-2xl text-foreground">
                Estuda Flash
              </span>
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary opacity-50"></div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            {user ? (
              // Se usuário estiver logado, mostrar botão para dashboard
              <Button
                onClick={handleDashboardClick}
                className="bg-primary hover:opacity-90 text-white font-medium"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Ir para Dashboard
              </Button>
            ) : (
              // Se não estiver logado, mostrar botões de login/cadastro
              <>
                <Button variant="outline" asChild className="border-purple-300 text-primary hover:bg-primary/5">
                  <Link to="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    Entrar
                  </Link>
                </Button>
                <Button
                  asChild
                  className="bg-primary hover:opacity-90 text-white font-medium"
                >
                  <Link to="/signup">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Criar Conta
                  </Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
