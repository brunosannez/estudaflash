
interface Alternative {
  emoji: string;
  letter: string;
  bg: string;
  border: string;
  text: string;
  hover: string;
  selected: string;
  correct: string;
  wrong: string;
}

interface QuizAlternativesProps {
  alternatives: string[];
  selectedAnswer: number | null;
  correctAnswer: number;
  showResult: boolean;
  onAnswerSelect: (index: number) => void;
}

const QuizAlternatives = ({ 
  alternatives, 
  selectedAnswer, 
  correctAnswer, 
  showResult, 
  onAnswerSelect 
}: QuizAlternativesProps) => {
  const alternativeStyles: Alternative[] = [
    { 
      emoji: "🔵", 
      letter: "A", 
      bg: "bg-blue-50", 
      border: "border-blue-300", 
      text: "text-blue-700", 
      hover: "hover:bg-blue-100",
      selected: "bg-blue-200 border-blue-500",
      correct: "bg-blue-100 border-blue-500 shadow-blue-200",
      wrong: "bg-red-100 border-red-400"
    },
    { 
      emoji: "🟢", 
      letter: "B", 
      bg: "bg-emerald-50", 
      border: "border-emerald-300", 
      text: "text-emerald-700", 
      hover: "hover:bg-emerald-100",
      selected: "bg-emerald-200 border-emerald-500",
      correct: "bg-emerald-100 border-emerald-500 shadow-emerald-200",
      wrong: "bg-red-100 border-red-400"
    },
    { 
      emoji: "🟠", 
      letter: "C", 
      bg: "bg-orange-50", 
      border: "border-orange-300", 
      text: "text-orange-700", 
      hover: "hover:bg-orange-100",
      selected: "bg-orange-200 border-orange-500",
      correct: "bg-orange-100 border-orange-500 shadow-orange-200",
      wrong: "bg-red-100 border-red-400"
    },
    { 
      emoji: "🟣", 
      letter: "D", 
      bg: "bg-purple-50", 
      border: "border-purple-300", 
      text: "text-purple-700", 
      hover: "hover:bg-purple-100",
      selected: "bg-purple-200 border-purple-500",
      correct: "bg-purple-100 border-purple-500 shadow-purple-200",
      wrong: "bg-red-100 border-red-400"
    }
  ];

  return (
    <div className="space-y-2">
      {alternatives.map((alt, index) => {
        const altStyle = alternativeStyles[index];
        const isSelected = selectedAnswer === index;
        const isCorrect = showResult && index === correctAnswer;
        const isWrong = showResult && isSelected && index !== correctAnswer;
        
        let buttonClass = `w-full p-3 lg:p-4 rounded-xl border-2 text-left transition-all duration-300 transform hover:scale-[1.01] font-nunito font-semibold text-xs lg:text-sm`;
        
        if (showResult) {
          if (isCorrect) {
            buttonClass += ` ${altStyle.correct} ${altStyle.text} animate-pulse shadow-lg`;
          } else if (isWrong) {
            buttonClass += ` ${altStyle.wrong} text-red-800 shadow-lg`;
          } else {
            buttonClass += ` bg-gray-100 border-gray-300 text-gray-600`;
          }
        } else if (isSelected) {
          buttonClass += ` ${altStyle.selected} ${altStyle.text} scale-[1.01] shadow-lg`;
        } else {
          buttonClass += ` ${altStyle.bg} ${altStyle.border} ${altStyle.text} ${altStyle.hover} hover:shadow-lg hover:animate-pulse`;
        }
        
        return (
          <button
            key={index}
            onClick={() => onAnswerSelect(index)}
            disabled={showResult}
            className={buttonClass}
          >
            <div className="flex items-center space-x-2 lg:space-x-3">
              <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center font-fredoka text-sm lg:text-lg font-bold
                ${isSelected || (showResult && isCorrect) ? 'bg-white shadow-md' : 
                  showResult && isCorrect ? 'bg-green-200 animate-bounce' :
                  showResult && isWrong ? 'bg-red-200' :
                  'bg-white/70'
                }`}>
                <span className="text-lg lg:text-xl">{altStyle.emoji}</span>
                <span className={`ml-1 text-xs lg:text-sm ${isSelected ? altStyle.text : 'text-gray-700'}`}>
                  {altStyle.letter}
                </span>
              </div>
              <span className="flex-1 leading-relaxed">{alt}</span>
              {showResult && isCorrect && (
                <span className="text-lg lg:text-xl animate-bounce">✅</span>
              )}
              {showResult && isWrong && (
                <span className="text-lg lg:text-xl">❌</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default QuizAlternatives;
