interface BrandLogoProps {
  size?: number;
  className?: string;
}

// Logo Estuda Flash: pilha de flashcards em leque dentro do quadrado teal
const BrandLogo = ({ size = 40, className }: BrandLogoProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <rect width="48" height="48" rx="14" fill="hsl(187 60% 16%)" />
    <g transform="rotate(-14 24 28)">
      <rect x="11" y="20" width="23" height="15" rx="3.5" fill="hsl(33 89% 53%)" />
    </g>
    <g transform="rotate(-4 24 26)">
      <rect x="12.5" y="16.5" width="23" height="15" rx="3.5" fill="hsl(74 55% 46%)" />
    </g>
    <g transform="rotate(7 24 24)">
      <rect x="14" y="13" width="23" height="15" rx="3.5" fill="hsl(41 66% 93%)" />
      <line x1="18" y1="19" x2="31" y2="19" stroke="hsl(187 40% 60%)" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="18" y1="23" x2="27" y2="23" stroke="hsl(187 40% 72%)" strokeWidth="1.6" strokeLinecap="round" />
    </g>
  </svg>
);

export default BrandLogo;
