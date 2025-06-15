
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { PlanType } from '@/types/plans';
import { designColors } from '@/utils/designSystem';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('free');
  const [loading, setLoading] = useState(false);
  const { signUpWithEmail } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const plans = [
    {
      id: 'free' as PlanType,
      name: 'Plano Gratuito',
      price: 'R$ 0/mês',
      features: [
        '10 uploads por mês',
        '10 quizzes',
        '10 flashcards',
        'Modelos de IA básicos',
        'Suporte por email'
      ],
      popular: false
    },
    {
      id: 'pro' as PlanType,
      name: 'Plano Pro',
      price: 'R$ 29,90/mês',
      features: [
        '100 uploads por mês',
        'Quizzes com GPT-4',
        'Flashcards com modo de memória avançado',
        'Acompanhamento de progresso e gamificação',
        'Acesso antecipado a novas ferramentas',
        'Suporte prioritário'
      ],
      popular: true
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
    <div className={`min-h-screen ${designColors.backgrounds.main} relative overflow-hidden`}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-200 rounded-full opacity-50 animate-bounce"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-cyan-200 rounded-full opacity-50 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-green-200 rounded-full opacity-50 animate-bounce"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
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

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              Escolha seu plano e comece a estudar! 🚀
            </h2>
            <p className="text-lg text-gray-600">
              Crie sua conta e transforme seus estudos com IA
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Plan Selection */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Escolha seu plano</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`relative cursor-pointer transition-all duration-300 ${
                      selectedPlan === plan.id
                        ? 'ring-2 ring-purple-500 shadow-lg scale-105'
                        : 'hover:shadow-md border-gray-200'
                    } ${plan.popular ? 'border-2 border-purple-300' : ''}`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                          🌟 Mais Popular
                        </span>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-xl text-gray-800">{plan.name}</CardTitle>
                      <CardDescription className="text-2xl font-bold text-purple-600">
                        {plan.price}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-3">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="mt-6 flex justify-center">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedPlan === plan.id
                            ? 'bg-purple-500 border-purple-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedPlan === plan.id && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Signup Form */}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
