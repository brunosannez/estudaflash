
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { usePlans } from '@/hooks/usePlans';
import { CreditCard, Edit, Check, X, Loader2 } from 'lucide-react';
import { Plan } from '@/types/plans';

const PlansManagement = () => {
  const { plans, loading, updatePlan } = usePlans();
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Plan>>({});
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const handleEditStart = (plan: Plan) => {
    setEditingPlan(plan.id);
    setEditData(plan);
  };

  const handleEditCancel = () => {
    setEditingPlan(null);
    setEditData({});
  };

  const handleEditSave = async () => {
    if (!editingPlan || !editData) return;

    try {
      setUpdating(true);
      await updatePlan(editingPlan, editData);
      setEditingPlan(null);
      setEditData({});
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
    } finally {
      setUpdating(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getPlanBadgeVariant = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return 'secondary';
      case 'pro':
        return 'default';
      case 'pro max':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Carregando planos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <CardTitle>Gerenciamento de Planos</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Configure preços e recursos dos planos de assinatura
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {plans.map((plan) => (
            <div key={plan.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge variant={getPlanBadgeVariant(plan.name)}>
                    {plan.name}
                  </Badge>
                  <Switch
                    checked={plan.is_editable}
                    onCheckedChange={(checked) => {
                      if (editingPlan === plan.id) {
                        setEditData(prev => ({ ...prev, is_editable: checked }));
                      } else {
                        updatePlan(plan.id, { is_editable: checked });
                      }
                    }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {plan.is_editable ? 'Editável' : 'Bloqueado'}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  {editingPlan === plan.id ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditCancel}
                        disabled={updating}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleEditSave}
                        disabled={updating}
                      >
                        {updating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditStart(plan)}
                      disabled={!plan.is_editable}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium">Preço Mensal</Label>
                  {editingPlan === plan.id ? (
                    <Input
                      type="number"
                      value={editData.price_brl || 0}
                      onChange={(e) => setEditData(prev => ({ 
                        ...prev, 
                        price_brl: parseFloat(e.target.value) || 0 
                      }))}
                      className="mt-1"
                      step="0.01"
                      min="0"
                    />
                  ) : (
                    <div className="mt-1 text-lg font-bold text-green-600">
                      {formatPrice(plan.price_brl)}
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium">Preço Anual</Label>
                  {editingPlan === plan.id ? (
                    <Input
                      type="number"
                      value={editData.price_brl_yearly || 0}
                      onChange={(e) => setEditData(prev => ({ 
                        ...prev, 
                        price_brl_yearly: parseFloat(e.target.value) || 0 
                      }))}
                      className="mt-1"
                      step="0.01"
                      min="0"
                    />
                  ) : (
                    <div className="mt-1 text-lg font-bold text-green-600">
                      {formatPrice(plan.price_brl_yearly)}
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium">Uploads/Mês</Label>
                  {editingPlan === plan.id ? (
                    <Input
                      type="number"
                      value={editData.uploads_limit || 0}
                      onChange={(e) => setEditData(prev => ({ 
                        ...prev, 
                        uploads_limit: parseInt(e.target.value) || 0 
                      }))}
                      className="mt-1"
                      min="0"
                    />
                  ) : (
                    <div className="mt-1 text-sm font-medium">
                      {plan.uploads_limit}
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium">Resumos/Mês</Label>
                  {editingPlan === plan.id ? (
                    <Input
                      type="number"
                      value={editData.summaries_limit || 0}
                      onChange={(e) => setEditData(prev => ({ 
                        ...prev, 
                        summaries_limit: parseInt(e.target.value) || 0 
                      }))}
                      className="mt-1"
                      min="0"
                    />
                  ) : (
                    <div className="mt-1 text-sm font-medium">
                      {plan.summaries_limit}
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium">Flashcards/Mês</Label>
                  {editingPlan === plan.id ? (
                    <Input
                      type="number"
                      value={editData.flashcards_limit || 0}
                      onChange={(e) => setEditData(prev => ({ 
                        ...prev, 
                        flashcards_limit: parseInt(e.target.value) || 0 
                      }))}
                      className="mt-1"
                      min="0"
                    />
                  ) : (
                    <div className="mt-1 text-sm font-medium">
                      {plan.flashcards_limit}
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium">Quizzes/Mês</Label>
                  {editingPlan === plan.id ? (
                    <Input
                      type="number"
                      value={editData.quizzes_limit || 0}
                      onChange={(e) => setEditData(prev => ({ 
                        ...prev, 
                        quizzes_limit: parseInt(e.target.value) || 0 
                      }))}
                      className="mt-1"
                      min="0"
                    />
                  ) : (
                    <div className="mt-1 text-sm font-medium">
                      {plan.quizzes_limit}
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium">Modelo Quiz</Label>
                  {editingPlan === plan.id ? (
                    <Select
                      value={editData.quiz_model || plan.quiz_model}
                      onValueChange={(value) => setEditData(prev => ({ 
                        ...prev, 
                        quiz_model: value 
                      }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GPT-3.5">GPT-3.5</SelectItem>
                        <SelectItem value="GPT-4o">GPT-4o</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-1 text-sm">
                      <Badge variant="outline">{plan.quiz_model}</Badge>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium">Modelo Resumo</Label>
                  {editingPlan === plan.id ? (
                    <Select
                      value={editData.summary_model || plan.summary_model}
                      onValueChange={(value) => setEditData(prev => ({ 
                        ...prev, 
                        summary_model: value 
                      }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Claude 3">Claude 3</SelectItem>
                        <SelectItem value="Claude 3.5">Claude 3.5</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-1 text-sm">
                      <Badge variant="outline">{plan.summary_model}</Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlansManagement;
