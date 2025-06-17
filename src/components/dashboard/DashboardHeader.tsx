
import { Sparkles } from 'lucide-react';
import { designColors } from '@/utils/designSystem';
import { useUserProfile } from '@/hooks/useUserProfile';

const DashboardHeader = () => {
  const { getDisplayName } = useUserProfile();

  return (
    <div className="pt-8 mb-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-8 h-8 text-cyan-500 animate-pulse" />
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-700 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            Olá, {getDisplayName()}!
          </h1>
          <Sparkles className="w-8 h-8 text-purple-500 animate-pulse" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 max-w-4xl mx-auto border border-purple-100 shadow-lg">
        <p className="text-xl md:text-2xl text-gray-700 font-medium text-center leading-relaxed">
          🎓 Transforme suas imagens de estudo em aventuras de aprendizado incríveis! ✨
        </p>
      </div>
    </div>
  );
};

export default DashboardHeader;
