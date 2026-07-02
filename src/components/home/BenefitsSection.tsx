import { FileText, Layers, ListChecks, Network, Flame, ScanText } from 'lucide-react';

const resources = [
  {
    icon: ScanText,
    title: 'Leitura de fotos e anotações',
    description: 'Envie fotos do caderno, livro ou slides — a IA extrai o texto, mesmo de manuscritos.',
  },
  {
    icon: FileText,
    title: 'Resumos inteligentes',
    description: 'Resumos didáticos com conceitos-chave, dicas de memorização e glossário, adaptados à sua idade.',
  },
  {
    icon: Layers,
    title: 'Flashcards personalizados',
    description: 'Cartões no estilo Anki gerados do seu próprio material, prontos para revisão espaçada.',
  },
  {
    icon: ListChecks,
    title: 'Quizzes estilo ENEM',
    description: 'Questões objetivas e de verdadeiro/falso criadas a partir do seu resumo, com justificativa.',
  },
  {
    icon: Network,
    title: 'Mapas mentais',
    description: 'Visualize o conteúdo em mapas mentais organizados por tópicos e subtópicos.',
  },
  {
    icon: Flame,
    title: 'Gamificação de verdade',
    description: 'XP, níveis, conquistas e sequência diária para manter a motivação em alta.',
  },
];

const BenefitsSection = () => {
  return (
    <section id="recursos" className="py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-3">
            Tudo que você precisa para aprender
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Funciona para todas as matérias: de história a matemática, do fundamental ao vestibular.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {resources.map((item) => (
            <div
              key={item.title}
              className="bg-card rounded-2xl border border-border/60 shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 grid place-items-center mb-4">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-1.5">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
