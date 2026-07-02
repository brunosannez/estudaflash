import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, LayoutDashboard } from 'lucide-react';
import BrandLogo, { BrandWordmark } from '@/components/common/BrandLogo';

const navLinks = [
  { label: 'Recursos', href: '#recursos' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Planos', href: '#planos' },
  { label: 'Depoimentos', href: '#depoimentos' },
];

const HomeHeader = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-border/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/home" className="flex items-center gap-2.5">
          <BrandLogo size={36} className="rounded-[10px]" />
          <BrandWordmark className="text-lg" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-foreground/70 hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          {user ? (
            <Button
              onClick={() => navigate('/', { replace: true })}
              size="sm"
              className="rounded-xl font-semibold"
            >
              <LayoutDashboard className="h-4 w-4 mr-1.5" />
              Ir para Dashboard
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild className="rounded-xl font-semibold">
                <Link to="/login">
                  <LogIn className="h-4 w-4 mr-1.5" />
                  Entrar
                </Link>
              </Button>
              <Button size="sm" asChild className="rounded-xl font-semibold">
                <Link to="/signup">
                  <UserPlus className="h-4 w-4 mr-1.5" />
                  Criar Conta
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
