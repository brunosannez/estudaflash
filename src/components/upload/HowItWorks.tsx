
import { FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const MAX_IMAGES = 5;

const HowItWorks = () => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center space-x-3 mb-4">
        <FileText className="h-6 w-6 text-primary" />
        <h3 className="text-lg font-semibold">Como funciona com múltiplas imagens:</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
        <div className="flex flex-col items-center text-center p-4 bg-primary/5 rounded-lg">
          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold mb-2">1</div>
          <p>Selecione até {MAX_IMAGES} imagens do seu material de estudo</p>
        </div>
        <div className="flex flex-col items-center text-center p-4 bg-primary/5 rounded-lg">
          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold mb-2">2</div>
          <p>Google Vision OCR extrai texto de cada imagem</p>
        </div>
        <div className="flex flex-col items-center text-center p-4 bg-green-50 rounded-lg">
          <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mb-2">3</div>
          <p>Os textos são combinados em um documento único</p>
        </div>
        <div className="flex flex-col items-center text-center p-4 bg-orange-50 rounded-lg">
          <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mb-2">4</div>
          <p>Gere resumos e flashcards do conteúdo completo</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default HowItWorks;
