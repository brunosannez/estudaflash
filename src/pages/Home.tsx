
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { designColors } from '@/utils/designSystem';
import HomeHeader from '@/components/home/HomeHeader';
import FloatingElements from '@/components/home/FloatingElements';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import BenefitsSection from '@/components/home/BenefitsSection';
import HomeFooter from '@/components/home/HomeFooter';
import PricingSection from '@/components/home/PricingSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import { Loader2 } from 'lucide-react';

const Home = () => {
  const { user, loading } = useAuth();

  console.log('🏠 Home page rendering - User:', !!user, 'Loading:', loading);

  // Se está carregando, mostrar loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg text-foreground/80">Carregando...</span>
      </div>
    );
  }

  // Se o usuário está logado, redirecionar para o dashboard
  if (user) {
    console.log('🔄 User authenticated, redirecting to dashboard');
    return <Navigate to="/" replace />;
  }

  // Mostrar landing page apenas para usuários não autenticados
  return (
    <div className={`min-h-screen ${designColors.backgrounds.main} relative overflow-hidden`}>
      <FloatingElements />
      <HomeHeader />
      <HeroSection />
      <FeaturesSection />
      <BenefitsSection />
      <PricingSection />
      <TestimonialsSection />
      <HomeFooter />
    </div>
  );
};

export default Home;
