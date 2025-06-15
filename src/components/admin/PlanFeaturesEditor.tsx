
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface PlanFeaturesEditorProps {
  features: string[];
  onChange: (features: string[]) => void;
}

const PlanFeaturesEditor = ({ features, onChange }: PlanFeaturesEditorProps) => {
  const [newFeature, setNewFeature] = useState('');

  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      onChange([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (featureToRemove: string) => {
    onChange(features.filter(feature => feature !== featureToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFeature();
    }
  };

  return (
    <div className="space-y-2 mt-1">
      <div className="flex flex-wrap gap-1">
        {features.map((feature, index) => (
          <Badge key={index} variant="secondary" className="text-xs flex items-center gap-1">
            {feature}
            <X 
              className="h-3 w-3 cursor-pointer hover:text-red-500" 
              onClick={() => removeFeature(feature)}
            />
          </Badge>
        ))}
      </div>
      
      <div className="flex gap-1">
        <Input
          value={newFeature}
          onChange={(e) => setNewFeature(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nova característica"
          className="text-xs h-8"
        />
        <Button 
          type="button"
          onClick={addFeature}
          size="sm"
          className="h-8 w-8 p-0"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default PlanFeaturesEditor;
