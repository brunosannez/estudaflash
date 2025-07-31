import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEnhancedQuizSystem } from '@/hooks/useEnhancedQuizSystem';

interface QuizConfigurationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigCreate: (config: any) => void;
}

const QuizConfigurationModal = ({ open, onOpenChange, onConfigCreate }: QuizConfigurationModalProps) => {
  const { createConfiguration } = useEnhancedQuizSystem();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    time_limit_minutes: 15,
    questions_count: 10,
    difficulty_level: 1,
    randomize_questions: true,
    randomize_answers: true,
    show_explanations: true,
    allow_hints: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const config = await createConfiguration(formData);
      onConfigCreate(config);
      onOpenChange(false);
      setFormData({
        name: '',
        description: '',
        time_limit_minutes: 15,
        questions_count: 10,
        difficulty_level: 1,
        randomize_questions: true,
        randomize_answers: true,
        show_explanations: true,
        allow_hints: false
      });
    } catch (error) {
      console.error('Error creating configuration:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Configuração de Quiz</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="time_limit">Tempo Limite (minutos)</Label>
            <Input
              id="time_limit"
              type="number"
              value={formData.time_limit_minutes}
              onChange={(e) => setFormData(prev => ({ ...prev, time_limit_minutes: parseInt(e.target.value) }))}
              min="1"
              max="120"
            />
          </div>

          <div>
            <Label htmlFor="questions_count">Número de Questões</Label>
            <Input
              id="questions_count"
              type="number"
              value={formData.questions_count}
              onChange={(e) => setFormData(prev => ({ ...prev, questions_count: parseInt(e.target.value) }))}
              min="1"
              max="50"
            />
          </div>

          <div>
            <Label htmlFor="difficulty">Dificuldade</Label>
            <Select value={formData.difficulty_level.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty_level: parseInt(value) }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Fácil</SelectItem>
                <SelectItem value="2">Médio</SelectItem>
                <SelectItem value="3">Difícil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="randomize_questions"
              checked={formData.randomize_questions}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, randomize_questions: checked }))}
            />
            <Label htmlFor="randomize_questions">Randomizar Questões</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="show_explanations"
              checked={formData.show_explanations}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_explanations: checked }))}
            />
            <Label htmlFor="show_explanations">Mostrar Explicações</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Criar Configuração</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuizConfigurationModal;