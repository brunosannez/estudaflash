import { Star } from 'lucide-react';
import foliSmall from '@/assets/foli-small.webp';

const testimonials = [
  {
    name: 'Marina, 16',
    context: '2º ano do Ensino Médio',
    text: 'Eu tirava foto do caderno e pronto: resumo, flashcards e quiz na hora. Minhas notas de biologia subiram muito.',
  },
  {
    name: 'Pedro, 17',
    context: 'Vestibulando',
    text: 'Os quizzes estilo ENEM são a melhor parte. Estudo no ônibus revisando os flashcards do dia anterior.',
  },
  {
    name: 'Cláudia',
    context: 'Mãe do Théo, 12',
    text: 'Meu filho finalmente estuda sem eu mandar. A sequência diária virou um jogo pra ele — e as notas agradecem.',
  },
];

const TestimonialsSection = () => {
  return (
    <section id="depoimentos" className="py-16 sm:py-24 bg-card/60">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center mb-12">
          <img src={foliSmall} alt="" className="w-16 mb-4 mix-blend-multiply dark:mix-blend-normal" draggable={false} />
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-3">
            Quem estuda com o Foli, aprova
          </h2>
          <p className="text-lg text-muted-foreground">Estudantes de todo o Brasil já mudaram seu jeito de estudar.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-card rounded-2xl border border-border/60 shadow-sm p-6">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-brand-orange fill-brand-orange" />
                ))}
              </div>
              <p className="text-sm text-foreground/85 leading-relaxed mb-4">“{t.text}”</p>
              <p className="text-sm font-bold text-foreground">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.context}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
