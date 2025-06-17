
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SuccessPopupProps {
  show: boolean;
  onClose: () => void;
  message?: string;
}

const SuccessPopup = ({ show, onClose, message = "Dados sincronizados com sucesso!" }: SuccessPopupProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  // Only show popup on dashboard route
  const shouldShowPopup = location.pathname === '/';

  useEffect(() => {
    if (show && shouldShowPopup) {
      setIsVisible(true);
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, 3000);

      return () => clearTimeout(timer);
    } else if (show && !shouldShowPopup) {
      // If popup should show but we're not on dashboard, close it immediately
      onClose();
    }
  }, [show, shouldShowPopup, onClose]);

  // Don't render if not on dashboard or if not showing
  if (!shouldShowPopup || (!show && !isVisible)) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    }`}>
      <Card className="bg-green-50 border-green-200 shadow-lg min-w-80 max-w-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span className="text-green-800 font-medium text-sm">{message}</span>
            </div>
            <Button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-green-600 hover:text-green-700 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuccessPopup;
