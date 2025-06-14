
import { designColors } from '@/utils/designSystem';

const FloatingBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className={`absolute top-10 left-5 sm:top-20 sm:left-10 ${designColors.responsive.floatingElements} animate-bounce`}>⭐</div>
      <div className={`absolute top-20 right-10 sm:top-40 sm:right-20 ${designColors.responsive.floatingElements} animate-pulse`}>🌟</div>
      <div className={`absolute bottom-10 left-10 sm:bottom-20 sm:left-20 ${designColors.responsive.floatingElements} animate-float`}>✨</div>
      <div className={`absolute bottom-20 right-5 sm:bottom-40 sm:right-10 ${designColors.responsive.floatingElements} animate-bounce`}>🎯</div>
    </div>
  );
};

export default FloatingBackground;
