
interface QuizQuestionProps {
  question: string;
  currentQuestionIndex: number;
  totalQuestions: number;
}

const QuizQuestion = ({ question, currentQuestionIndex, totalQuestions }: QuizQuestionProps) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl lg:text-2xl font-semibold text-gray-700 mb-3 font-fredoka">
        Pergunta {currentQuestionIndex + 1} de {totalQuestions}
      </h2>
      <p className="text-gray-600 font-nunito text-base lg:text-lg leading-relaxed">
        {question}
      </p>
    </div>
  );
};

export default QuizQuestion;
