import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Filter, X } from 'lucide-react';
import { FlashcardCategory } from '@/types/flashcard';

interface CategoryFilterProps {
  categories: FlashcardCategory[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategorySelect
}) => {
  if (categories.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtrar por categoria:</span>
          {selectedCategory && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCategorySelect(null)}
              className="h-6 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedCategory === null ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/20"
            onClick={() => onCategorySelect(null)}
          >
            Todas
          </Badge>
          
          {categories.map((category) => (
            <Badge
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className="cursor-pointer hover:opacity-80"
              style={{
                backgroundColor: selectedCategory === category.id ? category.color : 'transparent',
                borderColor: category.color,
                color: selectedCategory === category.id ? 'white' : category.color
              }}
              onClick={() => onCategorySelect(category.id)}
            >
              {category.icon} {category.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryFilter;