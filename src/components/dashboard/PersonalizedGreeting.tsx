
import { Sparkles, Coffee, Sun, Moon, Stars } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';

const PersonalizedGreeting = () => {
  const { getDisplayName } = useUserProfile();
  
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return {
        greeting: "Bom dia",
        icon: Sun,
        color: "text-brand-orange",
        bg: "bg-brand-orange/10",
        message: "Que tal começar o dia estudando? ☀️"
      };
    } else if (hour >= 12 && hour < 18) {
      return {
        greeting: "Boa tarde",
        icon: Coffee,
        color: "text-brand-orange",
        bg: "bg-brand-orange/10",
        message: "Hora perfeita para uma sessão de estudos! ☕"
      };
    } else if (hour >= 18 && hour < 22) {
      return {
        greeting: "Boa noite",
        icon: Moon,
        color: "text-primary",
        bg: "bg-primary/5",
        message: "Vamos revisar o que aprendemos hoje? 🌙"
      };
    } else {
      return {
        greeting: "Boa madrugada",
        icon: Stars,
        color: "text-primary",
        bg: "bg-primary/5",
        message: "Estudando até tarde? Você é dedicado! ⭐"
      };
    }
  };

  const timeInfo = getTimeBasedGreeting();
  const IconComponent = timeInfo.icon;

  return (
    <div className={`${timeInfo.bg} rounded-2xl p-6 mb-6 border border-border/60`}>
      <div className="flex items-center justify-center gap-4 mb-4">
        <Sparkles className="w-6 h-6 text-primary animate-pulse" />
        <div className="flex items-center gap-3">
          <IconComponent className={`w-6 h-6 ${timeInfo.color}`} />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {timeInfo.greeting}, {getDisplayName()}!
          </h1>
        </div>
        <Sparkles className="w-6 h-6 text-primary animate-pulse" />
      </div>
      
      <p className="text-center text-lg text-foreground/80 font-medium">
        {timeInfo.message}
      </p>
    </div>
  );
};

export default PersonalizedGreeting;
