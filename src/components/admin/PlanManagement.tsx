
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { usePlans } from '@/hooks/usePlans';
import { CreditCard, Edit, Check, X, Loader2, Plus, Star, Crown, Zap } from 'lucide-react';
import { Plan, AI_MODELS } from '@/types/plans';
import PlanFeaturesEditor from './PlanFeaturesEditor';
import CreatePlanModal from './CreatePlanModal';

const PlanManagement = () => {
  const { plans, loading, updatePlan, createPlan } = usePlans();
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Plan>>({});
  const [updating, setUpdating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
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

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return <Zap className="h-5 w-5 text-muted-foreground" />;
      case 'pro':
        return <Star className="h-5 w-5 text-blue-500" />;
      case 'pro max':
        return <Crown className="h-5 w-5 text-primary" />;
      default:
        return <Zap className="h-5 w-5 text-muted-foreground" />;
    }
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
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <CardTitle>Gerenciamento de Planos</CardTitle>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Criar Novo Plano
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure preços e recursos dos planos de assinatura
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${!plan.is_active ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPlanIcon(plan.name)}
                      <Badge variant={getPlanBadgeVariant(plan.name) as any}>
                        {plan.name}
                      </Badge>
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

                  {editingPlan === plan.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editData.description || ''}
                        onChange={(e) => setEditData(prev => ({ 
                          ...prev, 
                          description: e.target.value 
                        }))}
                        placeholder="Descrição do plano"
                        className="min-h-[60px]"
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground min-h-[60px]">
                      {plan.description}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Preço Mensal</Label>
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
                        <div className="text-lg font-bold text-green-600">
                          {formatPrice(plan.price_brl)}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Preço Anual</Label>
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
                        <div className="text-lg font-bold text-green-600">
                          {formatPrice(plan.price_brl_yearly)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Uploads</Label>
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
                        <div className="text-sm font-medium">{plan.uploads_limit}</div>
                      )}
                    </div>

                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Flashcards</Label>
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
                        <div className="text-sm font-medium">{plan.flashcards_limit}</div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Quizzes</Label>
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
                        <div className="text-sm font-medium">{plan.quizzes_limit}</div>
                      )}
                    </div>

                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Resumos</Label>
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
                        <div className="text-sm font-medium">{plan.summaries_limit}</div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Quiz Model</Label>
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
                            {AI_MODELS.quiz.map(model => (
                              <SelectItem key={model} value={model}>{model}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className="mt-1">{plan.quiz_model}</Badge>
                      )}
                    </div>

                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Summary Model</Label>
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
                            {AI_MODELS.summary.map(model => (
                              <SelectItem key={model} value={model}>{model}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className="mt-1">{plan.summary_model}</Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Features</Label>
                    {editingPlan === plan.id ? (
                      <PlanFeaturesEditor
                        features={editData.features || []}
                        onChange={(features) => setEditData(prev => ({ ...prev, features }))}
                      />
                    ) : (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {plan.features?.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={editingPlan === plan.id ? editData.is_active : plan.is_active}
                        onCheckedChange={(checked) => {
                          if (editingPlan === plan.id) {
                            setEditData(prev => ({ ...prev, is_active: checked }));
                          } else {
                            updatePlan(plan.id, { is_active: checked });
                          }
                        }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {(editingPlan === plan.id ? editData.is_active : plan.is_active) ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <CreatePlanModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreatePlan={createPlan}
      />
    </>
  );
};

export default PlanManagement;
