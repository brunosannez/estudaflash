
import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, LogIn, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { designColors } from '@/utils/designSystem';
import { useAuth } from '@/hooks/useAuth';
import GoogleIcon from '@/components/common/GoogleIcon';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithGoogle } = useAuth();

  // ProtectedRoute salva a rota de origem em state.from para voltar após o login
  const from = location.state?.from?.pathname || '/';

  console.log('🔐 Login page rendering');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      console.log('🔄 Attempting login for:', email);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Login error:', error);
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('✅ Login successful');
        toast({
          title: "Sucesso!",
          description: "Login realizado com sucesso.",
        });
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      toast({
        title: "Erro inesperado",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error('❌ Google login error:', error);
      toast({
        title: "Erro no login com Google",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${designColors.backgrounds.main} relative overflow-hidden`}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/15 rounded-full opacity-50 animate-bounce"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-primary/20 rounded-full opacity-50 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-brand-orange/20 rounded-full opacity-50 animate-bounce"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/home')}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <div className="absolute inset-0 bg-primary/10 animate-pulse rounded-xl"></div>
                <Zap className="text-lg text-white relative z-10" />
              </div>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>
            </div>
            <h1 className="text-xl font-bold text-foreground">
              Estuda Flash
            </h1>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Bem-vindo de volta! 👋
            </h2>
            <p className="text-lg text-muted-foreground">
              Faça login para continuar seus estudos
            </p>
          </div>

          <Card className="shadow-xl border-2 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-foreground">Fazer Login</CardTitle>
              <CardDescription>
                Entre com suas credenciais
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-foreground/80 font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="password" className="text-foreground/80 font-medium">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                <div className="text-right">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:text-primary font-medium"
                  >
                    Esqueci minha senha
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:opacity-90 text-white font-medium py-2.5"
                  disabled={loading || !email || !password}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>

              {/* Separador */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-input" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">ou continue com</span>
                </div>
              </div>

              {/* Botão Google */}
              <Button
                type="button"
                variant="outline"
                className="w-full border-input hover:bg-muted/50 font-medium"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
              >
                <GoogleIcon className="h-5 w-5 mr-2" />
                {googleLoading ? 'Conectando...' : 'Entrar com Google'}
              </Button>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Não tem uma conta?{' '}
                  <Link
                    to="/signup"
                    className="text-primary hover:text-primary font-medium"
                  >
                    Criar conta grátis
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
