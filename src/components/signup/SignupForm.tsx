
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useActivePlans } from '@/hooks/usePlans';

interface SignupFormProps {
  selectedPlanId: string;
}

const SignupForm = ({ selectedPlanId }: SignupFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { plans } = useActivePlans();

  const selectedPlan = plans.find(plan => plan.id === selectedPlanId);

  const createUserUsageRecord = async (userId: string, planId: string) => {
    try {
      console.log('Creating usage record for user:', userId, 'with plan:', planId);
      
      const { error } = await supabase
        .from('uso_usuarios')
        .insert({
          user_id: userId,
          plan_id: planId,
          is_admin: false,
          uploads_realizados: 0,
          flashcards_gerados: 0,
          quizzes_realizados: 0,
        });

      if (error) {
        console.error('Error creating user usage record:', error);
        throw error;
      }
      
      console.log('Usage record created successfully');
    } catch (err) {
      console.error('Error in createUserUsageRecord:', err);
      throw err;
    }
  };

  const getValidPlanId = async (): Promise<string> => {
    try {
      // Se já temos um plano selecionado válido, usar ele
      if (selectedPlanId && selectedPlanId.trim() !== '') {
        console.log('Using selected plan:', selectedPlanId);
        return selectedPlanId;
      }

      // Caso contrário, buscar o plano Free
      console.log('No plan selected, searching for Free plan...');
      const { data, error } = await supabase
        .from('plans')
        .select('id')
        .eq('name', 'Free')
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.error('Error finding Free plan:', error);
        // Se não encontrar o Free, pegar o primeiro plano ativo disponível
        const { data: firstPlan, error: firstPlanError } = await supabase
          .from('plans')
          .select('id')
          .eq('is_active', true)
          .limit(1)
          .single();

        if (firstPlanError || !firstPlan) {
          throw new Error('Nenhum plano ativo encontrado no sistema');
        }

        console.log('Using first available plan:', firstPlan.id);
        return firstPlan.id;
      }

      console.log('Using Free plan:', data.id);
      return data.id;
    } catch (err) {
      console.error('Error getting valid plan ID:', err);
      throw err;
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || password.length < 6) {
      toast({
        title: "Erro de validação",
        description: "Email é obrigatório e senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Garantir que temos um plano válido antes de prosseguir
      const validPlanId = await getValidPlanId();
      
      if (!validPlanId) {
        toast({
          title: "Erro de configuração",
          description: "Não foi possível determinar um plano válido. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      console.log('Creating user with plan ID:', validPlanId);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            plan_id: validPlanId
          }
        }
      });

      if (error) {
        console.error('Auth signup error:', error);
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (!data.user) {
        toast({
          title: "Erro no cadastro",
          description: "Não foi possível criar a conta.",
          variant: "destructive",
        });
        return;
      }

      console.log('User created successfully:', data.user.id);

      // Criar registro de uso imediatamente após criar o usuário
      await createUserUsageRecord(data.user.id, validPlanId);

      if (!data.user.email_confirmed_at) {
        toast({
          title: "Conta criada com sucesso! 🎉",
          description: "Verifique seu email para confirmar sua conta.",
        });
      } else {
        toast({
          title: "Conta criada com sucesso! 🎉",
          description: "Bem-vindo ao EstudoFácil AI!",
        });
        navigate('/');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Erro inesperado",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Verificar se temos planos carregados antes de permitir o cadastro
  const canSignup = plans.length > 0 && !loading;

  return (
    <div className="lg:col-span-1">
      <Card className="sticky top-8 shadow-xl border-2 border-purple-200 relative z-20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-gray-800">Criar Conta</CardTitle>
          <CardDescription>
            Preencha seus dados para começar
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-700 font-medium">
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
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Senha
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

            {selectedPlan && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Plano selecionado:</strong>
                </p>
                <div className="space-y-1">
                  <p className="text-purple-700 font-medium">
                    {selectedPlan.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatPrice(selectedPlan.price_brl)}/mês
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedPlan.uploads_limit} uploads • {selectedPlan.quizzes_limit} quizzes • {selectedPlan.flashcards_limit} flashcards
                  </p>
                </div>
              </div>
            )}

            {!canSignup && (
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-700">
                  Carregando planos disponíveis...
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-2.5 relative z-20"
              disabled={!canSignup}
              style={{ pointerEvents: 'auto' }}
            >
              {loading ? 'Criando conta...' : 'Criar Conta Grátis 🎉'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="text-purple-600 hover:text-purple-700 font-medium relative z-20"
                style={{ pointerEvents: 'auto' }}
              >
                Fazer login aqui
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupForm;
