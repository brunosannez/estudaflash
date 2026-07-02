import { ArrowRight, Check, Sparkles, Trophy, Flame, Lightbulb, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import foliMascote from '@/assets/foli-mascote.webp';

const heroChecks = ['Grátis para começar', 'Sem cartão de crédito', 'Resultados em segundos'];

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto px-4 py-14 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-6 items-center">
          {/* Texto */}
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-1.5 text-sm font-semibold text-primary shadow-sm mb-6">
              <Sparkles className="h-4 w-4 text-brand-orange" />
              Seu novo jeito de estudar
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight leading-[1.08] text-foreground mb-5">
              Transforme seus estudos com{' '}
              <span className="text-primary">Inteligência Artificial</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Resumos inteligentes, flashcards personalizados e quizzes adaptativos
              em segundos. Estude de forma mais eficiente e divertida! 🚀
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link to="/new-signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-2xl px-7 h-13 py-6 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
                >
                  Começar Gratuitamente
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto rounded-2xl px-7 py-6 text-base font-bold bg-card"
                >
                  Já tenho conta
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {heroChecks.map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-sm font-medium text-foreground/70">
                  <span className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center">
                    <Check className="h-3 w-3 text-accent" strokeWidth={3} />
                  </span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Foli + cards flutuantes */}
          <div className="relative flex justify-center lg:justify-end">
            <img
              src={foliMascote}
              alt="Foli, o mascote do Estuda Flash"
              className="w-72 sm:w-96 lg:w-[26rem] select-none mix-blend-multiply dark:mix-blend-normal dark:rounded-3xl"
              draggable={false}
            />

            {/* Resumo gerado */}
            <div className="absolute top-2 left-0 sm:left-4 lg:-left-6 bg-card rounded-2xl shadow-lg border border-border/60 p-4 w-48 hidden sm:block animate-fade-in">
              <div className="flex items-center gap-2 mb-2.5">
                <Lightbulb className="h-4 w-4 text-brand-orange" />
                <span className="text-sm font-bold text-foreground">Resumo gerado</span>
              </div>
              {['Conceitos principais', 'Tópicos organizados', 'Linguagem simplificada'].map((t) => (
                <div key={t} className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-accent flex items-center justify-center shrink-0">
                    <Check className="h-2.5 w-2.5 text-accent-foreground" strokeWidth={3.5} />
                  </span>
                  <span className="text-xs text-muted-foreground">{t}</span>
                </div>
              ))}
              <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-2/3 rounded-full bg-accent" />
              </div>
            </div>

            {/* Flashcards criados */}
            <div className="absolute -top-4 right-0 lg:-right-2 bg-card rounded-2xl shadow-lg border border-border/60 p-4 w-44 hidden lg:block">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-foreground">Flashcards criados</span>
              </div>
              <p className="text-lg font-extrabold text-foreground leading-none">42 cartões</p>
              <p className="text-xs text-muted-foreground mt-1">Prontos para revisar</p>
            </div>

            {/* Quiz adaptativo */}
            <div className="absolute top-1/3 -right-2 lg:right-0 bg-card rounded-2xl shadow-lg border border-border/60 p-4 w-40 hidden xl:block">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-brand-orange">💡</span>
                <span className="text-sm font-bold text-foreground">Quiz adaptativo</span>
              </div>
              <div className="flex items-center justify-center my-1">
                <div className="relative w-16 h-16 rounded-full grid place-items-center"
                  style={{ background: 'conic-gradient(hsl(var(--brand-lime)) 306deg, hsl(var(--muted)) 0deg)' }}>
                  <div className="w-12 h-12 rounded-full bg-card grid place-items-center">
                    <span className="text-sm font-extrabold text-foreground">85%</span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-center font-semibold text-brand-orange">Mandou bem! 🎉</p>
            </div>

            {/* Conquistas */}
            <div className="absolute bottom-14 left-0 sm:left-6 lg:-left-2 bg-card rounded-2xl shadow-lg border border-border/60 p-4 w-36 hidden sm:block">
              <div className="flex items-center gap-2 mb-1.5">
                <Trophy className="h-4 w-4 text-brand-orange" />
                <span className="text-sm font-bold text-foreground">Conquistas</span>
              </div>
              <p className="text-2xl font-extrabold text-foreground leading-none">12</p>
              <p className="text-xs text-muted-foreground">Conquistas 🥇</p>
            </div>

            {/* Sequência diária */}
            <div className="absolute bottom-2 right-2 lg:right-4 bg-card rounded-2xl shadow-lg border border-border/60 p-4 w-40 hidden md:block">
              <div className="flex items-center gap-2 mb-1.5">
                <Flame className="h-4 w-4 text-brand-orange" />
                <span className="text-sm font-bold text-foreground">Sequência diária</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-extrabold text-foreground leading-none">7 <span className="text-xs font-semibold text-muted-foreground">dias</span></p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Continue assim!</p>
                </div>
                <div className="flex items-end gap-0.5 h-8">
                  {[3, 4.5, 4, 6, 7.5].map((h, i) => (
                    <div key={i} className="w-1.5 rounded-sm bg-accent" style={{ height: `${h * 4}px` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
