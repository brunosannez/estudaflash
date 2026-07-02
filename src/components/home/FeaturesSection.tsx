import { CloudUpload, Wand2, BookOpenCheck, Trophy } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: CloudUpload,
    iconClass: 'bg-primary/10 text-primary',
    title: 'Envie seu material',
    description: 'Fotos das suas anotações, livros ou slides. Nós cuidamos do resto.',
  },
  {
    number: '02',
    icon: Wand2,
    iconClass: 'bg-accent/15 text-accent',
    title: 'IA cria para você',
    description: 'Resumos, flashcards e quizzes personalizados em segundos.',
  },
  {
    number: '03',
    icon: BookOpenCheck,
    iconClass: 'bg-primary/10 text-primary',
    title: 'Estude de forma ativa',
    description: 'Revise com flashcards e teste seus conhecimentos com quizzes.',
  },
  {
    number: '04',
    icon: Trophy,
    iconClass: 'bg-brand-orange/15 text-brand-orange',
    title: 'Acompanhe seu progresso',
    description: 'Veja sua evolução, mantenha a consistência e alcance seus objetivos.',
  },
];

const FeaturesSection = () => {
  return (
    <section id="como-funciona" className="py-16 sm:py-24 bg-card/60">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-3">
            ✨ Como funciona
          </h2>
          <p className="text-lg text-muted-foreground">Em 4 passos super fáceis!</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-card rounded-2xl border border-border/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm font-extrabold text-brand-orange">{step.number}</span>
              </div>
              <div className={`w-12 h-12 rounded-xl grid place-items-center mb-4 ${step.iconClass}`}>
                <step.icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-foreground mb-1.5">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
