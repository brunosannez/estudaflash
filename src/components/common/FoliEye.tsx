interface FoliEyeProps {
  size?: number;
  className?: string;
}

// Símbolo secundário da marca: o olho do Foli, usado como indicador de
// loading (pisca conforme o guia de marca)
const FoliEye = ({ size = 48, className }: FoliEyeProps) => (
  <svg
    width={size}
    height={size * 0.6}
    viewBox="0 0 100 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Carregando"
    role="status"
  >
    <g className="foli-eye-blink" style={{ transformOrigin: '50px 30px' }}>
      {/* contorno amendoado */}
      <path
        d="M4 30 Q30 2 50 2 Q70 2 96 30 Q70 58 50 58 Q30 58 4 30 Z"
        fill="hsl(200 63% 14%)"
      />
      {/* íris verde-limão sorrindo */}
      <path
        d="M26 34 Q50 54 74 34 Q70 46 50 48 Q30 46 26 34 Z"
        fill="hsl(78 67% 54%)"
      />
      {/* brilho */}
      <path
        d="M60 16 l2.6 6.4 6.4 2.6 -6.4 2.6 -2.6 6.4 -2.6 -6.4 -6.4 -2.6 6.4 -2.6 Z"
        fill="hsl(40 36% 96%)"
      />
    </g>
  </svg>
);

export default FoliEye;
