
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Save, Wifi } from 'lucide-react';

interface FlashcardSessionStatusProps {
  sessionId: string | null;
  lastSaved?: Date;
  isOnline?: boolean;
}

const FlashcardSessionStatus = ({ sessionId, lastSaved, isOnline = true }: FlashcardSessionStatusProps) => {
  if (!sessionId) return null;

  return (
    <Card className="border border-gray-200 bg-gray-50">
      <CardContent className="p-3">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <Save className="h-3 w-3 text-green-500" />
            <span>Sessão: {sessionId.slice(0, 8)}...</span>
          </div>
          
          <div className="flex items-center gap-3">
            {lastSaved && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Salvo {lastSaved.toLocaleTimeString()}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Wifi className={`h-3 w-3 ${isOnline ? 'text-green-500' : 'text-red-500'}`} />
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlashcardSessionStatus;
