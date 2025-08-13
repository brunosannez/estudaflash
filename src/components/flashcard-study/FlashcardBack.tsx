
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Star } from 'lucide-react';

interface FlashcardBackProps {
  answer: string;
  example?: string;
  onAnswer: (remembered: boolean) => void;
  isAnimating: boolean;
}

const FlashcardBack = ({ answer, example, onAnswer, isAnimating }: FlashcardBackProps) => {
  return (
    <Card className="w-full h-full border-0 shadow-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-cyan-50 min-h-[500px]">
      <CardContent className="h-full flex flex-col justify-between p-6 min-h-[500px]">
        <div className="flex-1">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <Badge className="text-lg px-4 py-2 bg-green-100 text-green-700">
              💡 Resposta
            </Badge>
          </div>
          
          <div className="text-center mb-6 flex-1 flex flex-col justify-center">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 leading-relaxed">
              {answer}
            </h2>
            
            {example && (
              <div className="bg-white/70 rounded-xl p-4 border border-green-200 mt-4">
                <p className="text-sm font-semibold text-green-700 mb-2 flex items-center justify-center gap-2">
                  <Star className="h-4 w-4" />
                  Exemplo:
                </p>
                <p className="text-gray-700 italic">{example}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Botões de resposta fixos na parte inferior */}
        <div className="grid grid-cols-2 gap-4 mt-auto">
          <Button
            onClick={() => onAnswer(false)}
            disabled={isAnimating}
            variant="outline"
            size="lg"
            className="border-3 border-red-400 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-500 font-bold py-4 px-4 rounded-xl shadow-lg disabled:opacity-30 transition-all transform hover:scale-105 active:scale-95"
          >
            <XCircle className="h-5 w-5 mr-2" />
            <div className="text-center">
              <div className="text-sm font-semibold">😅 Não Lembrei</div>
              <div className="text-xs opacity-80 font-medium">(+2 XP)</div>
            </div>
          </Button>
          <Button
            onClick={() => onAnswer(true)}
            disabled={isAnimating}
            size="lg"
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-4 rounded-xl shadow-lg disabled:opacity-30 transition-all transform hover:scale-105 active:scale-95 border-2 border-green-400"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            <div className="text-center">
              <div className="text-sm font-semibold">🎉 Acertei!</div>
              <div className="text-xs opacity-90 font-medium">(+10 XP)</div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlashcardBack;
