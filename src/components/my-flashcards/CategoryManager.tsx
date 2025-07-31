import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useEnhancedFlashcards } from '@/hooks/useEnhancedFlashcards';
import { FlashcardCategory } from '@/types/flashcard';
import { EnhancedFlashcardService } from '@/services/enhancedFlashcardService';
import { toast } from 'sonner';

interface CategoryManagerProps {
  categories: FlashcardCategory[];
  onCategoryUpdate: () => void;
}

interface CategoryFormData {
  name: string;
  description: string;
  color: string;
  icon: string;
}

const DEFAULT_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

const DEFAULT_ICONS = [
  '📚', '🧠', '💡', '🎯', '🔬', '📝', '🎨', '🎵', 
  '⚡', '🌟', '🚀', '💪', '🏆', '🎓', '📊', '⭐'
];

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onCategoryUpdate }) => {
  const { createCategory } = useEnhancedFlashcards();
  const [editingCategory, setEditingCategory] = useState<FlashcardCategory | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    color: DEFAULT_COLORS[0],
    icon: DEFAULT_ICONS[0]
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: DEFAULT_COLORS[0],
      icon: DEFAULT_ICONS[0]
    });
  };

  const handleCreateCategory = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome da categoria é obrigatório');
      return;
    }

    try {
      await createCategory(
        formData.name.trim(),
        formData.description.trim() || undefined,
        formData.color,
        formData.icon
      );
      
      resetForm();
      setIsCreating(false);
      onCategoryUpdate();
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !formData.name.trim()) {
      toast.error('Nome da categoria é obrigatório');
      return;
    }

    try {
      await EnhancedFlashcardService.updateCategory(editingCategory.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        color: formData.color,
        icon: formData.icon
      });

      setEditingCategory(null);
      resetForm();
      onCategoryUpdate();
      toast.success('Categoria atualizada com sucesso!');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Erro ao atualizar categoria');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta categoria?')) {
      return;
    }

    try {
      await EnhancedFlashcardService.deleteCategory(categoryId);
      onCategoryUpdate();
      toast.success('Categoria deletada com sucesso!');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Erro ao deletar categoria');
    }
  };

  const startEditing = (category: FlashcardCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || DEFAULT_COLORS[0],
      icon: category.icon || DEFAULT_ICONS[0]
    });
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setIsCreating(false);
    resetForm();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gerenciar Categorias</h3>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreating(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Categoria</DialogTitle>
            </DialogHeader>
            <CategoryForm 
              formData={formData}
              setFormData={setFormData}
              onSave={handleCreateCategory}
              onCancel={cancelEditing}
              isEditing={false}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{category.icon}</span>
                  <CardTitle className="text-base">{category.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditing(category)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {category.description && (
                <p className="text-sm text-muted-foreground mb-2">
                  {category.description}
                </p>
              )}
              <Badge 
                variant="outline" 
                style={{ borderColor: category.color, color: category.color }}
              >
                {category.color}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
          </DialogHeader>
          <CategoryForm 
            formData={formData}
            setFormData={setFormData}
            onSave={handleEditCategory}
            onCancel={cancelEditing}
            isEditing={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface CategoryFormProps {
  formData: CategoryFormData;
  setFormData: (data: CategoryFormData) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ 
  formData, 
  setFormData, 
  onSave, 
  onCancel,
  isEditing 
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Nome *</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Nome da categoria"
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Descrição</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descrição opcional da categoria"
          rows={3}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Ícone</label>
        <div className="grid grid-cols-8 gap-2">
          {DEFAULT_ICONS.map((icon) => (
            <Button
              key={icon}
              variant={formData.icon === icon ? "default" : "outline"}
              size="sm"
              onClick={() => setFormData({ ...formData, icon })}
              className="text-lg h-10 w-10 p-0"
            >
              {icon}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Cor</label>
        <div className="grid grid-cols-8 gap-2">
          {DEFAULT_COLORS.map((color) => (
            <Button
              key={color}
              variant="outline"
              size="sm"
              onClick={() => setFormData({ ...formData, color })}
              className="h-10 w-10 p-0 border-2"
              style={{ 
                backgroundColor: formData.color === color ? color : 'transparent',
                borderColor: color,
                opacity: formData.color === color ? 1 : 0.7
              }}
            >
              {formData.color === color && (
                <span className="text-white font-bold">✓</span>
              )}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          {isEditing ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </div>
  );
};

export default CategoryManager;