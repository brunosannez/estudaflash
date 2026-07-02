
import { Trophy } from "lucide-react";

interface ProgressHeaderProps {
  level: number;
  getLevelTitle: (level: number) => string;
}

const ProgressHeader = ({ level, getLevelTitle }: ProgressHeaderProps) => {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center gap-3 mb-4">
        <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center animate-pulse">
          <Trophy className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-foreground">
            Nível {level}
          </h1>
          <p className="text-xl text-foreground font-semibold">
            {getLevelTitle(level)}
          </p>
        </div>
      </div>
      <p className="text-muted-foreground max-w-2xl mx-auto">
        Continue sua jornada de aprendizado e desbloqueie novas conquistas!
      </p>
    </div>
  );
};

export default ProgressHeader;
