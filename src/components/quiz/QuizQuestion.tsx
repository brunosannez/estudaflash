
interface QuizQuestionProps {
  question: string;
  currentQuestionIndex: number;
  totalQuestions: number;
}

const QuizQuestion = ({ question, currentQuestionIndex, totalQuestions }: QuizQuestionProps) => {
  return (
    <div className="mb-4">
      <h2 className="text-lg lg:text-xl font-semibold text-gray-700 mb-2 font-fredoka">
        Pergunta {currentQuestionIndex + 1} de {totalQuestions}
      </h2>
      <p className="text-gray-600 font-nunito text-sm lg:text-base leading-relaxed">
        {question}
      </p>
    </div>
  );
};

export default QuizQuestion;
