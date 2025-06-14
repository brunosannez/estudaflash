
import { Trophy } from "lucide-react";

interface ProgressHeaderProps {
  level: number;
  getLevelTitle: (level: number) => string;
}

const ProgressHeader = ({ level, getLevelTitle }: ProgressHeaderProps) => {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center gap-3 mb-4">
        <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
          <Trophy className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            Nível {level}
          </h1>
          <p className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-semibold">
            {getLevelTitle(level)}
          </p>
        </div>
      </div>
      <p className="text-gray-600 max-w-2xl mx-auto">
        Continue sua jornada de aprendizado e desbloqueie novas conquistas!
      </p>
    </div>
  );
};

export default ProgressHeader;
