import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Brain, Clock, Heart, Shuffle, Target, Play } from 'lucide-react';
import { StudyModeConfig, StudyMode } from '@/types/flashcard';
import { FlashcardCategory } from '@/types/flashcard';

interface StudyModeSelectorProps {
  categories: FlashcardCategory[];
  onStartStudy: (config: StudyModeConfig) => void;
}

const STUDY_MODES = [
  {
    mode: 'spaced_repetition' as StudyMode,
    name: 'Repetição Espaçada',
    description: 'Cards baseados no algoritmo de revisão',
    icon: Brain,
    color: 'blue'
  },
  {
    mode: 'category' as StudyMode,
    name: 'Por Categoria',
    description: 'Estudar cards de uma categoria específica',
    icon: Target,
    color: 'green'
  },
  {
    mode: 'favorites' as StudyMode,
    name: 'Favoritos',
    description: 'Apenas seus cards favoritos',
    icon: Heart,
    color: 'red'
  },
  {
    mode: 'difficulty' as StudyMode,
    name: 'Por Dificuldade',
    description: 'Cards filtrados por nível de dificuldade',
    icon: Clock,
    color: 'orange'
  },
  {
    mode: 'random' as StudyMode,
    name: 'Aleatório',
    description: 'Cards em ordem aleatória',
    icon: Shuffle,
    color: 'purple'
  }
];

const StudyModeSelector: React.FC<StudyModeSelectorProps> = ({
  categories,
  onStartStudy
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<StudyMode>('spaced_repetition');
  const [config, setConfig] = useState<StudyModeConfig>({
    mode: 'spaced_repetition',
    maxCards: 20,
    includeOverdue: true
  });

  const handleModeSelect = (mode: StudyMode) => {
    setSelectedMode(mode);
    setConfig(prev => ({ ...prev, mode }));
  };

  const handleStartStudy = () => {
    onStartStudy(config);
    setIsOpen(false);
  };

  const selectedModeData = STUDY_MODES.find(m => m.mode === selectedMode);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Play className="h-4 w-4" />
          Iniciar Estudo Personalizado
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurar Sessão de Estudo</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mode Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Modo de Estudo
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {STUDY_MODES.map((mode) => {
                const Icon = mode.icon;
                const isSelected = selectedMode === mode.mode;
                
                return (
                  <Card
                    key={mode.mode}
                    className={`cursor-pointer transition-all ${
                      isSelected 
                        ? 'ring-2 ring-primary border-primary' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => handleModeSelect(mode.mode)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Icon className={`h-5 w-5 text-${mode.color}-500 mt-0.5`} />
                        <div>
                          <h4 className="font-medium">{mode.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {mode.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Mode-specific Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {selectedModeData && <selectedModeData.icon className="h-4 w-4" />}
                Opções: {selectedModeData?.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category Selection for Category Mode */}
              {selectedMode === 'category' && (
                <div>
                  <Label htmlFor="category-select">Categoria</Label>
                  <Select
                    value={config.category || ''}
                    onValueChange={(value) => setConfig(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Difficulty Selection for Difficulty Mode */}
              {selectedMode === 'difficulty' && (
                <div>
                  <Label htmlFor="difficulty-select">Nível de Dificuldade</Label>
                  <Select
                    value={config.difficulty?.toString() || ''}
                    onValueChange={(value) => setConfig(prev => ({ ...prev, difficulty: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a dificuldade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Muito Fácil</SelectItem>
                      <SelectItem value="2">2 - Fácil</SelectItem>
                      <SelectItem value="3">3 - Médio</SelectItem>
                      <SelectItem value="4">4 - Difícil</SelectItem>
                      <SelectItem value="5">5 - Muito Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Include Overdue for Spaced Repetition */}
              {selectedMode === 'spaced_repetition' && (
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="include-overdue">Incluir Cards Atrasados</Label>
                    <p className="text-sm text-muted-foreground">
                      Incluir cards que deveriam ter sido revisados anteriormente
                    </p>
                  </div>
                  <Switch
                    id="include-overdue"
                    checked={config.includeOverdue || false}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeOverdue: checked }))}
                  />
                </div>
              )}

              {/* Max Cards */}
              <div>
                <Label htmlFor="max-cards">Número Máximo de Cards</Label>
                <Input
                  id="max-cards"
                  type="number"
                  min="1"
                  max="100"
                  value={config.maxCards || 20}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    maxCards: parseInt(e.target.value) || 20 
                  }))}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Limite de cards para esta sessão (1-100)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleStartStudy} className="gap-2">
              <Play className="h-4 w-4" />
              Iniciar Estudo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudyModeSelector;