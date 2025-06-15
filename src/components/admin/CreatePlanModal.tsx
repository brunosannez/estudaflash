
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plan, AI_MODELS } from '@/types/plans';
import PlanFeaturesEditor from './PlanFeaturesEditor';
import { Loader2 } from 'lucide-react';

interface CreatePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreatePlan: (planData: Omit<Plan, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

const CreatePlanModal = ({ open, onOpenChange, onCreatePlan }: CreatePlanModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_brl: 0,
    price_brl_yearly: 0,
    uploads_limit: 0,
    summaries_limit: 0,
    flashcards_limit: 0,
    quizzes_limit: 0,
    quiz_model: 'GPT-3.5',
    summary_model: 'Claude 3',
    flashcard_model: 'DeepSeek-V2',
    features: [] as string[],
    is_active: true,
    is_editable: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    try {
      setLoading(true);
      await onCreatePlan(formData);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price_brl: 0,
        price_brl_yearly: 0,
        uploads_limit: 0,
        summaries_limit: 0,
        flashcards_limit: 0,
        quizzes_limit: 0,
        quiz_model: 'GPT-3.5',
        summary_model: 'Claude 3',
        flashcard_model: 'DeepSeek-V2',
        features: [],
        is_active: true,
        is_editable: true
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao criar plano:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Plano</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Plano *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Professional"
                required
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label>Plano ativo</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o plano e seus benefícios"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price_brl">Preço Mensal (R$)</Label>
              <Input
                id="price_brl"
                type="number"
                value={formData.price_brl}
                onChange={(e) => setFormData(prev => ({ ...prev, price_brl: parseFloat(e.target.value) || 0 }))}
                step="0.01"
                min="0"
              />
            </div>
            
            <div>
              <Label htmlFor="price_brl_yearly">Preço Anual (R$)</Label>
              <Input
                id="price_brl_yearly"
                type="number"
                value={formData.price_brl_yearly}
                onChange={(e) => setFormData(prev => ({ ...prev, price_brl_yearly: parseFloat(e.target.value) || 0 }))}
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="uploads_limit">Limite de Uploads</Label>
              <Input
                id="uploads_limit"
                type="number"
                value={formData.uploads_limit}
                onChange={(e) => setFormData(prev => ({ ...prev, uploads_limit: parseInt(e.target.value) || 0 }))}
                min="0"
              />
            </div>
            
            <div>
              <Label htmlFor="summaries_limit">Limite de Resumos</Label>
              <Input
                id="summaries_limit"
                type="number"
                value={formData.summaries_limit}
                onChange={(e) => setFormData(prev => ({ ...prev, summaries_limit: parseInt(e.target.value) || 0 }))}
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="flashcards_limit">Limite de Flashcards</Label>
              <Input
                id="flashcards_limit"
                type="number"
                value={formData.flashcards_limit}
                onChange={(e) => setFormData(prev => ({ ...prev, flashcards_limit: parseInt(e.target.value) || 0 }))}
                min="0"
              />
            </div>
            
            <div>
              <Label htmlFor="quizzes_limit">Limite de Quizzes</Label>
              <Input
                id="quizzes_limit"
                type="number"
                value={formData.quizzes_limit}
                onChange={(e) => setFormData(prev => ({ ...prev, quizzes_limit: parseInt(e.target.value) || 0 }))}
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Modelo Quiz</Label>
              <Select
                value={formData.quiz_model}
                onValueChange={(value) => setFormData(prev => ({ ...prev, quiz_model: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODELS.quiz.map(model => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Modelo Resumo</Label>
              <Select
                value={formData.summary_model}
                onValueChange={(value) => setFormData(prev => ({ ...prev, summary_model: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODELS.summary.map(model => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Modelo Flashcard</Label>
              <Select
                value={formData.flashcard_model}
                onValueChange={(value) => setFormData(prev => ({ ...prev, flashcard_model: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODELS.flashcard.map(model => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Características do Plano</Label>
            <PlanFeaturesEditor
              features={formData.features}
              onChange={(features) => setFormData(prev => ({ ...prev, features }))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Plano'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePlanModal;
