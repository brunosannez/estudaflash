
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { PlanType } from '@/types/plans';

interface SignupFormProps {
  selectedPlan: PlanType;
}

const SignupForm = ({ selectedPlan }: SignupFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUpWithEmail } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const plans = [
    {
      id: 'free' as PlanType,
      name: 'Plano Gratuito',
    },
    {
      id: 'pro' as PlanType,
      name: 'Plano Pro',
    }
  ];

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
      const success = await signUpWithEmail(email, password, selectedPlan);
      if (success) {
        toast({
          title: "Conta criada com sucesso! 🎉",
          description: "Verifique seu email para confirmar sua conta.",
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg:col-span-1">
      <Card className="sticky top-8 shadow-xl border-2 border-purple-200">
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

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Plano selecionado:</strong>
              </p>
              <p className="text-purple-700 font-medium">
                {plans.find(p => p.id === selectedPlan)?.name}
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-2.5"
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar Conta Grátis 🎉'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="text-purple-600 hover:text-purple-700 font-medium"
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
