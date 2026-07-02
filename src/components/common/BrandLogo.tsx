import logoIcon from '@/assets/logo-icon.png';

interface BrandLogoProps {
  size?: number;
  className?: string;
}

// Ícone oficial Estuda Flash (flashcards em leque no quadrado petróleo)
const BrandLogo = ({ size = 40, className }: BrandLogoProps) => (
  <img
    src={logoIcon}
    width={size}
    height={size}
    alt=""
    aria-hidden="true"
    draggable={false}
    className={`select-none ${className ?? ''}`}
  />
);

// Wordmark oficial: "Estuda" em petróleo + "Flash" em teal
export const BrandWordmark = ({ className }: { className?: string }) => (
  <span className={`font-extrabold tracking-tight ${className ?? ''}`}>
    <span className="text-foreground">Estuda</span>{' '}
    <span className="text-brand-teal">Flash</span>
  </span>
);

export default BrandLogo;
