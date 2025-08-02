import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnhancedQuizSystem } from '@/hooks/useEnhancedQuizSystem';
import { Settings, Save, Trash2, Plus, Clock, Target, Shuffle, Brain } from 'lucide-react';
import { toast } from 'sonner';

const QuizConfigurationDashboard = () => {
  const {
    configurations,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
    isLoading
  } = useEnhancedQuizSystem();

  const [activeTab, setActiveTab] = useState("create");
  const [selectedConfig, setSelectedConfig] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    time_limit_minutes: 15,
    questions_count: 10,
    difficulty_level: 1,
    randomize_questions: true,
    randomize_answers: true,
    show_explanations: true,
    allow_hints: false,
    category_filters: []
  });

  const handleCreateConfig = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome da configuração é obrigatório');
      return;
    }

    try {
      await createConfiguration(formData);
      toast.success('Configuração criada com sucesso!');
      resetForm();
    } catch (error) {
      toast.error('Erro ao criar configuração');
    }
  };

  const handleUpdateConfig = async () => {
    if (!selectedConfig) return;

    try {
      await updateConfiguration(selectedConfig.id, formData);
      toast.success('Configuração atualizada com sucesso!');
      setSelectedConfig(null);
      resetForm();
    } catch (error) {
      toast.error('Erro ao atualizar configuração');
    }
  };

  const handleDeleteConfig = async (configId: string) => {
    try {
      await deleteConfiguration(configId);
      toast.success('Configuração excluída com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir configuração');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      time_limit_minutes: 15,
      questions_count: 10,
      difficulty_level: 1,
      randomize_questions: true,
      randomize_answers: true,
      show_explanations: true,
      allow_hints: false,
      category_filters: []
    });
  };

  const loadConfigToForm = (config: any) => {
    setFormData({
      name: config.name,
      description: config.description || '',
      time_limit_minutes: config.time_limit_minutes,
      questions_count: config.questions_count,
      difficulty_level: config.difficulty_level,
      randomize_questions: config.randomize_questions,
      randomize_answers: config.randomize_answers,
      show_explanations: config.show_explanations,
      allow_hints: config.allow_hints,
      category_filters: config.category_filters || []
    });
    setSelectedConfig(config);
    setActiveTab("create");
  };

  const difficultyLabels = {
    1: "Fácil",
    2: "Médio", 
    3: "Difícil"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Configurações de Quiz</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">
            {selectedConfig ? 'Editar' : 'Criar'} Configuração
          </TabsTrigger>
          <TabsTrigger value="manage">Gerenciar Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                {selectedConfig ? 'Editar' : 'Nova'} Configuração
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Configuração</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Quiz Rápido, Prova Final..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva quando usar esta configuração"
                  />
                </div>
              </div>

              {/* Quiz Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Tempo Limite (minutos): {formData.time_limit_minutes}
                    </Label>
                    <Slider
                      value={[formData.time_limit_minutes]}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, time_limit_minutes: value[0] }))}
                      max={60}
                      min={5}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Número de Questões: {formData.questions_count}
                    </Label>
                    <Slider
                      value={[formData.questions_count]}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, questions_count: value[0] }))}
                      max={30}
                      min={5}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Dificuldade
                    </Label>
                    <Select
                      value={formData.difficulty_level.toString()}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty_level: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">🟢 Fácil</SelectItem>
                        <SelectItem value="2">🟡 Médio</SelectItem>
                        <SelectItem value="3">🔴 Difícil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Shuffle className="h-4 w-4" />
                      Embaralhar Questões
                    </Label>
                    <Switch
                      checked={formData.randomize_questions}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, randomize_questions: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Shuffle className="h-4 w-4" />
                      Embaralhar Alternativas
                    </Label>
                    <Switch
                      checked={formData.randomize_answers}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, randomize_answers: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Mostrar Explicações</Label>
                    <Switch
                      checked={formData.show_explanations}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_explanations: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Permitir Dicas</Label>
                    <Switch
                      checked={formData.allow_hints}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allow_hints: checked }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={selectedConfig ? handleUpdateConfig : handleCreateConfig}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {selectedConfig ? 'Atualizar' : 'Salvar'} Configuração
                </Button>
                {selectedConfig && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedConfig(null);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          {configurations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma configuração salva</h3>
                <p className="text-muted-foreground mb-4">
                  Crie configurações personalizadas para seus quizzes
                </p>
                <Button onClick={() => setActiveTab("create")}>
                  Criar Primeira Configuração
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {configurations.map((config) => (
                <Card key={config.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{config.name}</h3>
                        {config.description && (
                          <p className="text-sm text-muted-foreground">{config.description}</p>
                        )}
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="secondary">
                            {config.questions_count} questões
                          </Badge>
                          <Badge variant="secondary">
                            {config.time_limit_minutes}min
                          </Badge>
                          <Badge variant="secondary">
                            {difficultyLabels[config.difficulty_level as keyof typeof difficultyLabels]}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadConfigToForm(config)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteConfig(config.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuizConfigurationDashboard;