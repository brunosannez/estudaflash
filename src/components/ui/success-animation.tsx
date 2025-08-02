import { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuccessAnimationProps {
  message: string;
  show: boolean;
  onComplete?: () => void;
  duration?: number;
}

export function SuccessAnimation({ 
  message, 
  show, 
  onComplete,
  duration = 3000 
}: SuccessAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  if (!show && !isVisible) return null;

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 transition-all duration-500 transform",
      isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
    )}>
      <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 min-w-[300px]">
        <CheckCircle2 className="h-5 w-5 animate-bounce" />
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}