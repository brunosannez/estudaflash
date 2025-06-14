
interface QuizCelebrationProps {
  show: boolean;
}

const QuizCelebration = ({ show }: QuizCelebrationProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div className="text-8xl animate-bounce">🎉</div>
      <div className="absolute top-1/4 left-1/4 text-6xl animate-pulse">⭐</div>
      <div className="absolute top-3/4 right-1/4 text-6xl animate-bounce delay-300">✨</div>
      <div className="absolute top-1/2 right-1/3 text-5xl animate-spin">🌟</div>
      <div className="absolute bottom-1/4 left-1/3 text-5xl animate-pulse delay-500">🎊</div>
    </div>
  );
};

export default QuizCelebration;
