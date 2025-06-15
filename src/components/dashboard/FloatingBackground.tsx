
import { designColors } from '@/utils/designSystem';

const FloatingBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className={`absolute top-10 left-5 sm:top-20 sm:left-10 ${designColors.responsive.floatingElements} animate-bounce-gentle no-cursor-interference gpu-accelerated`} style={{ animationDelay: '0s' }}>⭐</div>
      <div className={`absolute top-20 right-10 sm:top-40 sm:right-20 ${designColors.responsive.floatingElements} no-cursor-interference gpu-accelerated`} style={{ animationDelay: '0.5s' }}>🌟</div>
      <div className={`absolute bottom-10 left-10 sm:bottom-20 sm:left-20 ${designColors.responsive.floatingElements} animate-float no-cursor-interference gpu-accelerated`} style={{ animationDelay: '1s' }}>✨</div>
      <div className={`absolute bottom-20 right-5 sm:bottom-40 sm:right-10 ${designColors.responsive.floatingElements} animate-bounce-gentle no-cursor-interference gpu-accelerated`} style={{ animationDelay: '1.5s' }}>🎯</div>
    </div>
  );
};

export default FloatingBackground;
