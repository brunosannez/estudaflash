
import { designColors } from '@/utils/designSystem';
import HomeHeader from '@/components/home/HomeHeader';
import FloatingElements from '@/components/home/FloatingElements';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import BenefitsSection from '@/components/home/BenefitsSection';
import HomeFooter from '@/components/home/HomeFooter';

const Home = () => {
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
