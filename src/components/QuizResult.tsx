
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useGameification } from "@/hooks/useGameification";
import { useEffect } from "react";

interface QuizResultProps {
  acertos: number;
  total: number;
  onRestart: () => void;
}

const QuizResult = ({ acertos, total, onRestart }: QuizResultProps) => {
  const navigate = useNavigate();
  const { addXP } = useGameification();
  const pct = Math.round((acertos / total) * 100);
  
  // Adicionar XP de bônus baseado na performance
  useEffect(() => {
    const addBonusXP = async () => {
      try {
        if (pct >= 90) {
          await addXP(50, 'quiz_perfect');
        } else if (pct >= 80) {
          await addXP(30, 'quiz_excellent');
        } else if (pct >= 70) {
          await addXP(20, 'quiz_good');
        } else if (pct >= 50) {
          await addXP(10, 'quiz_complete');
        }
      } catch (error) {
        console.error("Erro ao adicionar XP de bônus:", error);
      }
    };

    addBonusXP();
  }, [pct, addXP]);
  
  const getPerformanceData = () => {
    if (pct >= 90) return {
      emoji: "🏆",
      title: "FANTÁSTICO!",
      message: "Você é um verdadeiro gênio!",
      badge: "🥇 Medalha de Ouro",
      color: "from-yellow-400 to-orange-500",
      bgColor: "from-yellow-50 to-orange-50",
      bonusXP: "+50 XP de bônus!"
    };
    if (pct >= 80) return {
      emoji: "🎉", 
      title: "EXCELENTE!",
      message: "Você mandou muito bem!",
      badge: "🥈 Medalha de Prata", 
      color: "from-blue-400 to-purple-500",
      bgColor: "from-blue-50 to-purple-50",
      bonusXP: "+30 XP de bônus!"
    };
    if (pct >= 70) return {
      emoji: "👏",
      title: "MUITO BOM!",
      message: "Você está no caminho certo!",
      badge: "🥉 Medalha de Bronze",
      color: "from-green-400 to-emerald-500", 
      bgColor: "from-green-50 to-emerald-50",
      bonusXP: "+20 XP de bônus!"
    };
    if (pct >= 50) return {
      emoji: "💪",
      title: "BOA TENTATIVA!",
      message: "Continue estudando, você vai conseguir!",
      badge: "🌟 Estrela do Esforço",
      color: "from-pink-400 to-rose-500",
      bgColor: "from-pink-50 to-rose-50",
      bonusXP: "+10 XP de bônus!"
    };
    return {
      emoji: "📚",
      title: "VAMOS ESTUDAR MAIS!",
      message: "Não desista! Cada erro é um aprendizado!",
      badge: "🎯 Foco no Aprendizado",
      color: "from-indigo-400 to-blue-500",
      bgColor: "from-indigo-50 to-blue-50",
      bonusXP: "Continue tentando!"
    };
  };

  const performance = getPerformanceData();

  return (
    <div className="max-w-2xl mx-auto">
      <Card className={`shadow-2xl border-0 bg-gradient-to-br ${performance.bgColor} overflow-hidden`}>
        <CardContent className="p-8">
          {/* Confetes animados */}
          <div className="relative mb-8">
            <div className="text-center">
              <div className="text-8xl mb-4 animate-bounce">
                {performance.emoji}
              </div>
              <h1 className={`text-4xl font-bold bg-gradient-to-r ${performance.color} bg-clip-text text-transparent mb-2`}>
                {performance.title}
              </h1>
              <p className="text-xl font-semibold text-gray-700 mb-4">
                {performance.message}
              </p>
            </div>
          </div>

          {/* Estatísticas principais */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 border-2 border-gray-100">
            <div className="text-center">
              <div className="flex justify-center items-center gap-4 mb-4">
                <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold">{acertos}</span>
                </div>
                <div className="text-2xl font-bold text-gray-400">/</div>
                <div className="bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold">{total}</span>
                </div>
              </div>
              
              <div className="text-3xl font-bold text-gray-800 mb-2">
                {pct}% de acerto
              </div>
              
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${performance.color} text-white font-bold shadow-lg mb-3`}>
                {performance.badge}
              </div>

              {/* XP de bônus */}
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-3 border-2 border-purple-200">
                <div className="text-purple-700 font-bold text-lg">
                  ⭐ {performance.bonusXP}
                </div>
              </div>
            </div>
          </div>

          {/* Barra de progresso visual */}
          <div className="mb-6">
            <div className="flex justify-between text-sm font-semibold text-gray-600 mb-2">
              <span>Seu desempenho</span>
              <span>{pct}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
              <div 
                className={`h-4 bg-gradient-to-r ${performance.color} rounded-full transition-all duration-1000 ease-out shadow-lg`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onRestart} 
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              size="lg"
            >
              🔄 Tentar Novamente
            </Button>
            
            <Button 
              onClick={() => navigate('/quiz-history')}
              variant="outline"
              className="border-2 border-blue-400 text-blue-600 hover:bg-blue-50 font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              size="lg"
            >
              📊 Ver Histórico
            </Button>
            
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="border-2 border-green-400 text-green-600 hover:bg-green-50 font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              size="lg"
            >
              🏠 Voltar ao Início
            </Button>
          </div>

          {/* Mensagem motivacional */}
          <div className="mt-6 text-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-700 font-medium">
              {pct >= 80 
                ? "🌟 Continue assim! Você está arrasando nos estudos!" 
                : "💪 Não desista! Cada tentativa te deixa mais inteligente!"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizResult;
