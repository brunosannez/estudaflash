
import { designColors } from '@/utils/designSystem';

interface SignupBackgroundProps {
  children: React.ReactNode;
}

const SignupBackground = ({ children }: SignupBackgroundProps) => {
  return (
    <div className={`min-h-screen ${designColors.backgrounds.main} relative overflow-hidden`}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full opacity-50 animate-bounce"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-primary/15 rounded-full opacity-50 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-green-200 rounded-full opacity-50 animate-bounce"></div>
      </div>
      {children}
    </div>
  );
};

export default SignupBackground;
