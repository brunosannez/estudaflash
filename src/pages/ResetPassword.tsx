
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Zap, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { designColors } from '@/utils/designSystem';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    // O link de recuperação autentica o usuário via token na URL.
    // O supabase-js processa o hash e emite PASSWORD_RECOVERY/SIGNED_IN;
    // se nenhuma sessão existir, o link é inválido ou expirou.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (session) {
        setHasRecoverySession(true);
        setCheckingSession(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (session) {
        setHasRecoverySession(true);
        setCheckingSession(false);
      } else {
        // Dá tempo do supabase-js processar o token do hash da URL
        setTimeout(() => {
          if (isMounted) setCheckingSession(false);
        }, 2500);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter no mínimo 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "A senha e a confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        console.error('❌ Password update error:', error);
        toast({
          title: "Erro ao redefinir senha",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Senha redefinida! ✅",
          description: "Sua nova senha já está ativa.",
        });
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('❌ Password update error:', error);
      toast({
        title: "Erro inesperado",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${designColors.backgrounds.main} relative overflow-hidden`}>
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="text-lg text-white" />
            </div>
            <h1 className="text-xl font-bold text-foreground">
              Estuda Flash
            </h1>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="shadow-xl border-2 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-foreground">Redefinir Senha</CardTitle>
              <CardDescription>
                Escolha sua nova senha
              </CardDescription>
            </CardHeader>

            <CardContent>
              {checkingSession ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Validando link de recuperação...</p>
                </div>
              ) : !hasRecoverySession ? (
                <div className="text-center space-y-4 py-4">
                  <p className="text-sm text-muted-foreground">
                    Link de recuperação inválido ou expirado. Solicite um novo link
                    para redefinir sua senha.
                  </p>
                  <Link to="/forgot-password" className="block">
                    <Button className="w-full bg-primary hover:opacity-90 text-white">
                      Solicitar novo link
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="password" className="text-foreground/80 font-medium">
                      Nova senha
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1"
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirm-password" className="text-foreground/80 font-medium">
                      Confirmar nova senha
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Repita a nova senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1"
                      required
                      minLength={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:opacity-90 text-white font-medium py-2.5"
                    disabled={loading || !password || !confirmPassword}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {loading ? 'Salvando...' : 'Redefinir senha'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
