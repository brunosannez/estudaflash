// Decoração sutil de fundo — brilhos discretos no estilo do mockup,
// substituindo os emojis animados da versão anterior
const FloatingElements = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <span className="absolute top-24 left-[8%] text-brand-orange/40 text-xl">✦</span>
      <span className="absolute top-64 right-[6%] text-accent/40 text-sm">✦</span>
      <span className="absolute top-[38rem] left-[15%] text-primary/20 text-base">✦</span>
      <span className="absolute top-[52rem] right-[18%] text-brand-orange/30 text-sm">✦</span>
    </div>
  );
};

export default FloatingElements;
