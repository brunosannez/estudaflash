
import { designColors } from '@/utils/designSystem';

const FloatingElements = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className={`absolute top-10 left-5 sm:top-20 sm:left-10 ${designColors.responsive.floatingElements} animate-bounce-gentle`}>🌟</div>
      <div className={`absolute top-20 right-10 sm:top-32 sm:right-20 ${designColors.responsive.floatingElements} animate-wiggle`}>🎨</div>
      <div className={`absolute top-32 left-1/4 sm:top-64 ${designColors.responsive.floatingElements} animate-bounce-gentle delay-500`}>🚀</div>
      <div className={`absolute bottom-20 right-1/4 sm:bottom-32 ${designColors.responsive.floatingElements} animate-wiggle delay-1000`}>🎯</div>
      <div className={`absolute top-48 right-5 sm:top-96 sm:right-10 ${designColors.responsive.floatingElements} animate-bounce-gentle delay-300`}>⭐</div>
    </div>
  );
};

export default FloatingElements;
