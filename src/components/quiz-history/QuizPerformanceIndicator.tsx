
interface QuizPerformanceIndicatorProps {
  percentage: number;
}

const QuizPerformanceIndicator = ({ percentage }: QuizPerformanceIndicatorProps) => {
  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return "from-accent to-accent/80";
    if (percentage >= 80) return "from-primary to-primary/80";
    if (percentage >= 70) return "from-accent/80 to-accent";
    if (percentage >= 50) return "from-brand-orange to-brand-orange/80";
    return "from-muted to-muted/80";
  };

  const getPerformanceEmoji = (percentage: number) => {
    if (percentage >= 90) return "🏆";
    if (percentage >= 80) return "🎉";
    if (percentage >= 70) return "👏";
    if (percentage >= 50) return "💪";
    return "📚";
  };

  return (
    <div className="flex items-center gap-3 mb-2">
      <span className="text-3xl">{getPerformanceEmoji(percentage)}</span>
      <div className="flex-1">
        <div className="w-full bg-muted rounded-full h-3 mb-2">
          <div 
            className={`h-3 bg-gradient-to-r ${getPerformanceColor(percentage)} rounded-full transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default QuizPerformanceIndicator;
