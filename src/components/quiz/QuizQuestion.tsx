
interface QuizQuestionProps {
  question: string;
  currentQuestionIndex: number;
  totalQuestions: number;
}

const QuizQuestion = ({ question, currentQuestionIndex, totalQuestions }: QuizQuestionProps) => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        Questão {currentQuestionIndex + 1}
      </h2>
      <p className="text-gray-800 text-base leading-relaxed">
        {question}
      </p>
    </div>
  );
};

export default QuizQuestion;
