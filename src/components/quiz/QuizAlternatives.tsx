
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
  const alternativeLabels = ['A', 'B', 'C', 'D', 'E'];
  const alternativeColors = [
    'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100',
    'bg-green-50 border-green-300 text-green-700 hover:bg-green-100',
    'bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100',
    'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100',
    'bg-pink-50 border-pink-300 text-pink-700 hover:bg-pink-100'
  ];

  return (
    <div className="space-y-3 mb-6">
      {alternatives.map((alternativa: string, index: number) => {
        let buttonClass = `w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${alternativeColors[index]}`;
        
        if (showResult) {
          if (index === correctAnswer) {
            buttonClass = 'w-full p-4 text-left rounded-xl border-2 bg-green-100 border-green-500 text-green-800';
          } else if (index === selectedAnswer && index !== correctAnswer) {
            buttonClass = 'w-full p-4 text-left rounded-xl border-2 bg-red-100 border-red-500 text-red-800';
          } else {
            buttonClass = 'w-full p-4 text-left rounded-xl border-2 bg-gray-100 border-gray-300 text-gray-600';
          }
        } else if (selectedAnswer === index) {
          buttonClass += ' ring-2 ring-purple-500 scale-[1.02]';
        }

        return (
          <button
            key={index}
            onClick={() => onAnswerSelect(index)}
            disabled={showResult}
            className={buttonClass}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center font-bold text-sm">
                {alternativeLabels[index]}
              </div>
              <span className="flex-1">{alternativa}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default QuizAlternatives;
