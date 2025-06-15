
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Edit, Check, X } from 'lucide-react';
import { PLAN_CONFIGS, PlanType } from '@/types/plans';

interface PlanSettings {
  id: PlanType;
  name: string;
  displayName: string;
  price: number;
  currency: string;
  isActive: boolean;
  uploads: number;
  flashcards: number;
  quizzes: number;
  features: string[];
}

const PlanManagement = () => {
  const [editingPlan, setEditingPlan] = useState<PlanType | null>(null);
  const { toast } = useToast();

  const [plans, setPlans] = useState<PlanSettings[]>([
    {
      id: 'free',
      name: 'free',
      displayName: 'Gratuito',
      price: 0,
      currency: 'BRL',
      isActive: true,
      uploads: 10,
      flashcards: 10,
      quizzes: 10,
      features: ['OCR básico', 'Resumos limitados', 'Suporte por email']
    },
    {
      id: 'pro',
      name: 'pro',
      displayName: 'Professional',
      price: 29.90,
      currency: 'BRL',
      isActive: true,
      uploads: 100,
      flashcards: 100,
      quizzes: 100,
      features: ['OCR avançado', 'Resumos ilimitados', 'Flashcards inteligentes', 'Suporte prioritário']
    },
    {
      id: 'edu',
      name: 'edu',
      displayName: 'Educacional',
      price: 19.90,
      currency: 'BRL',
      isActive: true,
      uploads: Infinity,
      flashcards: Infinity,
      quizzes: Infinity,
      features: ['Tudo do Pro', 'Recursos educacionais', 'Relatórios de progresso', 'Integrações LMS']
    }
  ]);

  const handlePriceChange = (planId: PlanType, newPrice: number) => {
    setPlans(prev => prev.map(plan => 
      plan.id === planId ? { ...plan, price: newPrice } : plan
    ));
  };

  const handleToggleActive = (planId: PlanType) => {
    if (planId === 'free') {
      toast({
        title: "Aviso",
        description: "O plano gratuito não pode ser desativado.",
        variant: "destructive",
      });
      return;
    }

    setPlans(prev => prev.map(plan => 
      plan.id === planId ? { ...plan, isActive: !plan.isActive } : plan
    ));

    toast({
      title: "Sucesso!",
      description: `Plano ${planId === 'pro' ? 'Professional' : 'Educacional'} ${plans.find(p => p.id === planId)?.isActive ? 'desativado' : 'ativado'}.`,
    });
  };

  const saveChanges = () => {
    // Aqui você implementaria a lógica para salvar no backend
    toast({
      title: "Sucesso!",
      description: "Configurações de planos salvas com sucesso.",
    });
    setEditingPlan(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-600" />
          <CardTitle>Gerenciamento de Planos</CardTitle>
        </div>
        <p className="text-sm text-gray-600">
          Configure preços e recursos dos planos de assinatura
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {plans.map((plan) => (
            <div key={plan.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge variant={PLAN_CONFIGS[plan.id].badgeVariant}>
                    {plan.displayName}
                  </Badge>
                  <Switch
                    checked={plan.isActive}
                    onCheckedChange={() => handleToggleActive(plan.id)}
                    disabled={plan.id === 'free'}
                  />
                  <span className="text-sm text-gray-600">
                    {plan.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingPlan(editingPlan === plan.id ? null : plan.id)}
                >
                  {editingPlan === plan.id ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Preço Mensal</label>
                  {editingPlan === plan.id ? (
                    <Input
                      type="number"
                      value={plan.price}
                      onChange={(e) => handlePriceChange(plan.id, parseFloat(e.target.value))}
                      className="mt-1"
                      step="0.01"
                      min="0"
                    />
                  ) : (
                    <div className="mt-1 text-lg font-bold">
                      R$ {plan.price.toFixed(2)}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Uploads/Mês</label>
                  <div className="mt-1 text-sm">
                    {plan.uploads === Infinity ? 'Ilimitado' : plan.uploads}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Flashcards/Mês</label>
                  <div className="mt-1 text-sm">
                    {plan.flashcards === Infinity ? 'Ilimitado' : plan.flashcards}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Quizzes/Mês</label>
                  <div className="mt-1 text-sm">
                    {plan.quizzes === Infinity ? 'Ilimitado' : plan.quizzes}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium">Recursos Inclusos</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {plan.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button onClick={saveChanges} className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanManagement;
