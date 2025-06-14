
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Clock, Target, TrendingUp, BookOpen } from "lucide-react";

interface QuizResultProps {
  sessionResult: {
    quizTitle: string;
    correctAnswers: number;
    totalQuestions: number;
    completionTime: number;
    performance: {
      wrongAnswers: any[];
      suggestions: string[];
      weakTopics: any[];
    };
    questionsData: any[];
  };
  onRestart: () => void;
}

const QuizResult = ({ sessionResult, onRestart }: QuizResultProps) => {
  const navigate = useNavigate();
  const { quizTitle, correctAnswers, totalQuestions, completionTime, performance } = sessionResult;
  const pct = Math.round((correctAnswers / totalQuestions) * 100);
  
  const getPerformanceData = () => {
    if (pct >= 90) return {
      emoji: "🏆",
      title: "FANTÁSTICO!",
      message: "Você é um verdadeiro gênio!",
      badge: "🥇 Medalha de Ouro",
      color: "from-yellow-400 to-orange-500",
      bgColor: "from-yellow-50 to-orange-50"
    };
    if (pct >= 80) return {
      emoji: "🎉", 
      title: "EXCELENTE!",
      message: "Você mandou muito bem!",
      badge: "🥈 Medalha de Prata", 
      color: "from-blue-400 to-purple-500",
      bgColor: "from-blue-50 to-purple-50"
    };
    if (pct >= 70) return {
      emoji: "👏",
      title: "MUITO BOM!",
      message: "Você está no caminho certo!",
      badge: "🥉 Medalha de Bronze",
      color: "from-green-400 to-emerald-500", 
      bgColor: "from-green-50 to-emerald-50"
    };
    if (pct >= 50) return {
      emoji: "💪",
      title: "BOA TENTATIVA!",
      message: "Continue estudando, você vai conseguir!",
      badge: "🌟 Estrela do Esforço",
      color: "from-pink-400 to-rose-500",
      bgColor: "from-pink-50 to-rose-50"
    };
    return {
      emoji: "📚",
      title: "VAMOS ESTUDAR MAIS!",
      message: "Não desista! Cada erro é um aprendizado!",
      badge: "🎯 Foco no Aprendizado",
      color: "from-indigo-400 to-blue-500",
      bgColor: "from-indigo-50 to-blue-50"
    };
  };

  const performanceInfo = getPerformanceData();
  const minutes = Math.floor(completionTime / 60);
  const seconds = completionTime % 60;

  return (
    <div className="max-w-xl mx-auto">
      <Card className={`shadow-2xl border-0 bg-gradient-to-br ${performanceInfo.bgColor} overflow-hidden`}>
        <CardHeader className="pb-4">
          <div className="text-center">
            <div className="text-6xl mb-3 animate-bounce">
              {performanceInfo.emoji}
            </div>
            <CardTitle className={`text-2xl font-bold bg-gradient-to-r ${performanceInfo.color} bg-clip-text text-transparent mb-1`}>
              {performanceInfo.title}
            </CardTitle>
            <p className="text-lg font-semibold text-gray-700 mb-2">
              {performanceInfo.message}
            </p>
            <h3 className="text-sm font-medium text-gray-600">
              {quizTitle}
            </h3>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Estatísticas principais */}
          <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-100">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="flex justify-center items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-semibold text-gray-600">Acertos</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {correctAnswers}/{totalQuestions}
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-600">Tempo</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {minutes > 0 ? `${minutes}m ` : ''}{seconds}s
                </div>
              </div>
            </div>
            
            <div className="text-center mb-3">
              <div className="text-2xl font-bold text-gray-800 mb-2">
                {pct}% de aproveitamento
              </div>
              
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${performanceInfo.color} text-white font-bold text-sm shadow-lg`}>
                {performanceInfo.badge}
              </div>
            </div>

            {/* Barra de progresso */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
              <div 
                className={`h-3 bg-gradient-to-r ${performanceInfo.color} rounded-full transition-all duration-1000 ease-out shadow-lg`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* O que melhorar */}
          {performance.wrongAnswers.length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-orange-200">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <h4 className="font-bold text-orange-800">Pontos para Melhorar</h4>
              </div>
              <div className="space-y-2">
                {performance.weakTopics.slice(0, 2).map((topic: any, index: number) => (
                  <div key={index} className="text-sm text-orange-700 bg-orange-50 p-2 rounded-lg">
                    <strong>Questão:</strong> {topic.pergunta.slice(0, 60)}...
                    <br />
                    <strong>Resposta correta:</strong> {topic.alternativa_correta}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sugestões */}
          <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <h4 className="font-bold text-blue-800">Sugestões de Estudo</h4>
            </div>
            <ul className="space-y-1">
              {performance.suggestions.slice(0, 3).map((suggestion: string, index: number) => (
                <li key={index} className="text-sm text-blue-700 flex items-center gap-2">
                  <span className="text-blue-500">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col gap-3">
            <Button 
              onClick={onRestart} 
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              🔄 Tentar Novamente
            </Button>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => navigate('/quiz-history')}
                variant="outline"
                className="flex-1 border-2 border-blue-400 text-blue-600 hover:bg-blue-50 font-bold py-2 px-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                📊 Histórico
              </Button>
              
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="flex-1 border-2 border-green-400 text-green-600 hover:bg-green-50 font-bold py-2 px-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                🏠 Início
              </Button>
            </div>
          </div>

          {/* Mensagem motivacional */}
          <div className="text-center p-3 bg-white rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-700 font-medium text-sm">
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
