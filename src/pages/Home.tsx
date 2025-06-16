
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { designColors } from '@/utils/designSystem';
import HomeHeader from '@/components/home/HomeHeader';
import FloatingElements from '@/components/home/FloatingElements';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import BenefitsSection from '@/components/home/BenefitsSection';
import HomeFooter from '@/components/home/HomeFooter';
import { Loader2 } from 'lucide-react';

const Home = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      console.log('User is logged in, redirecting to dashboard');
      navigate('/', { replace: true }); // Corrigido: redirecionar para '/' em vez de '/dashboard'
    }
  }, [user, loading, navigate]);

  if (loading || (!loading && user)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-3 text-lg text-gray-700">Carregando...</span>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${designColors.backgrounds.main} relative overflow-hidden`}>
      <FloatingElements />
      <HomeHeader />
      <HeroSection />
      <FeaturesSection />
      <BenefitsSection />
      <HomeFooter />
    </div>
  );
};

export default Home;
