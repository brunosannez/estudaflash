
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, BookOpen, Lightbulb, Star, Quote, GraduationCap, Brain, HelpCircle, BookMarked } from 'lucide-react';

interface ResumoContentProps {
  content: string;
}

const ResumoContent = ({ content }: ResumoContentProps) => {
  // Detectar e renderizar seções especiais do resumo enriquecido
  const renderSpecialSection = (title: string, icon: React.ReactNode, bgColor: string, borderColor: string, children: React.ReactNode) => (
    <div className={`my-6 p-5 rounded-2xl ${bgColor} border-2 ${borderColor} shadow-md`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${borderColor.replace('border-', 'bg-').replace('-300', '-500')} text-white`}>
          {icon}
        </div>
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );

  const formatContent = (text: string) => {
    const lines = text.split('\n');
    const formattedElements: React.ReactNode[] = [];
    let currentSection: string | null = null;
    let sectionContent: string[] = [];

    const flushSection = () => {
      if (currentSection && sectionContent.length > 0) {
        const content = sectionContent.join('\n');
        
        if (currentSection.includes('CONCEITOS-CHAVE') || currentSection.includes('CONCEITOS CHAVE')) {
          formattedElements.push(
            renderSpecialSection(
              '📌 Conceitos-Chave',
              <BookMarked className="h-5 w-5" />,
              'bg-primary/5',
              'border-primary/20',
              <div className="space-y-2">
                {content.split('\n').filter(l => l.trim()).map((line, i) => (
                  <div key={i} className="flex items-start gap-2 bg-white/70 p-3 rounded-lg">
                    <span className="text-primary font-bold">•</span>
                    <span className="text-foreground/80">{line.replace(/^[-•]\s*/, '')}</span>
                  </div>
                ))}
              </div>
            )
          );
        } else if (currentSection.includes('DICAS DE MEMORIZAÇÃO') || currentSection.includes('MNEMÔNICOS')) {
          formattedElements.push(
            renderSpecialSection(
              '🧠 Dicas de Memorização',
              <Brain className="h-5 w-5" />,
              'bg-amber-50',
              'border-amber-300',
              <div className="space-y-2">
                {content.split('\n').filter(l => l.trim()).map((line, i) => (
                  <div key={i} className="bg-white/70 p-3 rounded-lg border-l-4 border-amber-400">
                    <span className="text-foreground/80">{line.replace(/^[-•]\s*/, '')}</span>
                  </div>
                ))}
              </div>
            )
          );
        } else if (currentSection.includes('TESTE SEU CONHECIMENTO') || currentSection.includes('PERGUNTAS')) {
          formattedElements.push(
            renderSpecialSection(
              '❓ Teste Seu Conhecimento',
              <HelpCircle className="h-5 w-5" />,
              'bg-border',
              'border-border',
              <div className="space-y-3">
                {content.split('\n').filter(l => l.trim()).map((line, i) => (
                  <div key={i} className="bg-white/70 p-4 rounded-lg flex items-start gap-3">
                    <span className="bg-primary text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-foreground/80">{line.replace(/^\d+[.)]\s*/, '').replace(/^[-•]\s*/, '')}</span>
                  </div>
                ))}
              </div>
            )
          );
        } else if (currentSection.includes('GLOSSÁRIO')) {
          formattedElements.push(
            renderSpecialSection(
              '📚 Glossário',
              <GraduationCap className="h-5 w-5" />,
              'bg-emerald-50',
              'border-emerald-300',
              <div className="grid gap-3 sm:grid-cols-2">
                {content.split('\n').filter(l => l.trim()).map((line, i) => {
                  const [term, definition] = line.split(':').map(s => s.trim());
                  return (
                    <div key={i} className="bg-white/70 p-3 rounded-lg">
                      <span className="font-semibold text-emerald-700">{term?.replace(/^[-•]\s*/, '')}</span>
                      {definition && (
                        <span className="text-muted-foreground">: {definition}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          );
        }
        
        sectionContent = [];
        currentSection = null;
      }
    };

    lines.forEach((line, index) => {
      // Detectar início de seção especial
      const specialSectionMatch = line.match(/^[📌🧠❓📚]\s*(CONCEITOS[-\s]?CHAVE|DICAS DE MEMORIZAÇÃO|MNEMÔNICOS|TESTE SEU CONHECIMENTO|PERGUNTAS|GLOSSÁRIO)/i) ||
                                   line.match(/^\*\*[📌🧠❓📚]?\s*(CONCEITOS[-\s]?CHAVE|DICAS DE MEMORIZAÇÃO|MNEMÔNICOS|TESTE SEU CONHECIMENTO|PERGUNTAS|GLOSSÁRIO)/i);
      
      if (specialSectionMatch) {
        flushSection();
        currentSection = line;
        return;
      }

      // Se estamos dentro de uma seção especial
      if (currentSection) {
        // Detectar fim da seção (linha vazia seguida de header ou nova seção)
        if (line.trim() === '' && sectionContent.length > 0) {
          // Verificar se a próxima linha é um novo header
          const nextLine = lines[index + 1];
          if (nextLine && (nextLine.startsWith('#') || nextLine.match(/^[📌🧠❓📚]/))) {
            flushSection();
            return;
          }
        }
        if (line.trim() !== '') {
          sectionContent.push(line);
        }
        return;
      }

      // Headers (lines starting with #)
      if (line.startsWith('# ')) {
        flushSection();
        formattedElements.push(
          <div key={`h1-${index}`} className="mb-6 mt-8 first:mt-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {line.substring(2)}
              </h1>
            </div>
            <div className="h-1 bg-primary rounded-full w-24"></div>
          </div>
        );
        return;
      }
      
      if (line.startsWith('## ')) {
        flushSection();
        formattedElements.push(
          <div key={`h2-${index}`} className="mb-4 mt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                <Lightbulb className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-emerald-700">
                {line.substring(3)}
              </h2>
            </div>
          </div>
        );
        return;
      }
      
      if (line.startsWith('### ')) {
        flushSection();
        formattedElements.push(
          <div key={`h3-${index}`} className="mb-3 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-amber-500 rounded-md flex items-center justify-center">
                <Star className="h-3 w-3 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-amber-700">
                {line.substring(4)}
              </h3>
            </div>
          </div>
        );
        return;
      }
      
      // Bullet points
      if (line.startsWith('• ') || line.startsWith('- ')) {
        formattedElements.push(
          <div key={`bullet-${index}`} className="flex items-start gap-3 mb-3 ml-4">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-foreground/80 leading-relaxed">
              {line.substring(2)}
            </p>
          </div>
        );
        return;
      }
      
      // Bold text
      if (line.includes('**')) {
        const parts = line.split('**');
        const formatted = parts.map((part, i) => 
          i % 2 === 1 ? (
            <span key={i} className="font-semibold bg-muted/50 px-1.5 py-0.5 rounded text-foreground">
              {part}
            </span>
          ) : part
        );
        formattedElements.push(
          <p key={`bold-${index}`} className="mb-4 text-foreground/80 leading-relaxed text-base sm:text-lg">
            {formatted}
          </p>
        );
        return;
      }
      
      // Empty lines
      if (line.trim() === '') {
        formattedElements.push(<div key={`space-${index}`} className="h-3" />);
        return;
      }
      
      // Regular paragraphs
      formattedElements.push(
        <div key={`p-${index}`} className="mb-4">
          <p className="text-foreground/80 leading-relaxed text-base sm:text-lg bg-muted/50 p-4 rounded-xl border-l-4 border-primary shadow-sm">
            {line}
          </p>
        </div>
      );
    });

    // Flush any remaining section
    flushSection();
    
    return formattedElements;
  };

  return (
    <div className="max-w-none">
      <Card className="overflow-hidden shadow-xl border-0 bg-gradient-to-br from-white via-border/30 to-primary/20/30">
        <CardHeader className="bg-primary text-white relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <CardTitle className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-bold">Seu Resumo</span>
              <span className="block text-sm sm:text-base font-normal text-white/80 mt-1">Material organizado para você estudar</span>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-5 sm:p-8 relative">
          {/* Decorative side line */}
          <div className="absolute left-0 top-0 w-1 h-full bg-primary rounded-r-full"></div>
          
          <div className="pl-4 sm:pl-6">
            <div className="prose prose-lg max-w-none">
              {formatContent(content)}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Resumo criado com IA para facilitar seus estudos</span>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumoContent;
