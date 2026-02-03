
const FloatingBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-10 left-5 sm:top-20 sm:left-10 text-2xl sm:text-3xl md:text-4xl opacity-20 animate-bounce no-cursor-interference" style={{ animationDelay: '0s' }}>⭐</div>
      <div className="absolute top-20 right-10 sm:top-40 sm:right-20 text-2xl sm:text-3xl md:text-4xl opacity-20 no-cursor-interference" style={{ animationDelay: '0.5s' }}>🌟</div>
      <div className="absolute bottom-10 left-10 sm:bottom-20 sm:left-20 text-2xl sm:text-3xl md:text-4xl opacity-20 animate-pulse no-cursor-interference" style={{ animationDelay: '1s' }}>✨</div>
      <div className="absolute bottom-20 right-5 sm:bottom-40 sm:right-10 text-2xl sm:text-3xl md:text-4xl opacity-20 animate-bounce no-cursor-interference" style={{ animationDelay: '1.5s' }}>🎯</div>
    </div>
  );
};

export default FloatingBackground;
