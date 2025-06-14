
import React from 'react';
import { Card } from '@/components/ui/card';

interface ResumoContentProps {
  content: string;
}

const ResumoContent = ({ content }: ResumoContentProps) => {
  // Função para processar e formatar o conteúdo do resumo
  const formatContent = (text: string) => {
    // Dividir o texto em linhas
    const lines = text.split('\n');
    const formattedLines: JSX.Element[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        formattedLines.push(<br key={index} />);
        return;
      }

      // Títulos principais (linhas que começam com # ou são todas maiúsculas e curtas)
      if (trimmedLine.startsWith('#') || 
          (trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length < 50 && !trimmedLine.includes('.'))) {
        formattedLines.push(
          <div key={index} className="bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 rounded-2xl p-6 my-6 shadow-2xl transform hover:scale-105 transition-all duration-300">
            <h2 className="text-3xl font-bold text-white text-center flex items-center justify-center gap-4">
              <span className="text-4xl animate-bounce">🌟</span>
              {trimmedLine.replace(/^#+\s*/, '')}
              <span className="text-4xl animate-bounce">🌟</span>
            </h2>
          </div>
        );
        return;
      }

      // Subtítulos (linhas que começam com ## ou terminam com :)
      if (trimmedLine.startsWith('##') || trimmedLine.endsWith(':')) {
        formattedLines.push(
          <div key={index} className="bg-gradient-to-r from-orange-300 via-yellow-400 to-pink-400 rounded-xl p-5 my-5 shadow-xl border-4 border-yellow-200">
            <h3 className="text-2xl font-bold text-orange-800 flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              {trimmedLine.replace(/^#+\s*/, '').replace(/:$/, '')}
            </h3>
          </div>
        );
        return;
      }

      // Pontos de lista (linhas que começam com -, *, •, ou números)
      if (/^[-*•]\s+/.test(trimmedLine) || /^\d+\.\s+/.test(trimmedLine)) {
        formattedLines.push(
          <div key={index} className="flex items-start gap-4 my-4 ml-6 p-5 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl border-l-8 border-green-400 shadow-lg hover:shadow-xl transition-shadow">
            <span className="text-3xl flex-shrink-0 animate-pulse">⭐</span>
            <p className="text-gray-800 leading-relaxed text-xl font-semibold">
              {trimmedLine.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '')}
            </p>
          </div>
        );
        return;
      }

      // Texto destacado (entre aspas ou parênteses)
      if ((trimmedLine.startsWith('"') && trimmedLine.endsWith('"')) ||
          (trimmedLine.startsWith('(') && trimmedLine.endsWith(')'))) {
        formattedLines.push(
          <div key={index} className="bg-gradient-to-r from-cyan-100 via-blue-100 to-purple-100 border-4 border-cyan-300 rounded-2xl p-6 my-5 shadow-xl">
            <div className="flex items-center gap-4">
              <span className="text-4xl">💡</span>
              <p className="text-blue-800 italic text-xl font-bold">
                {trimmedLine.replace(/^["(]/, '').replace(/[")]$/, '')}
              </p>
            </div>
          </div>
        );
        return;
      }

      // Parágrafos normais
      formattedLines.push(
        <div key={index} className="bg-white rounded-2xl p-6 my-4 shadow-lg border-2 border-gray-100 hover:border-purple-200 transition-colors">
          <p className="text-gray-800 leading-relaxed text-lg flex items-start gap-4">
            <span className="text-2xl flex-shrink-0">📚</span>
            <span className="font-medium">{trimmedLine}</span>
          </p>
        </div>
      );
    });

    return formattedLines;
  };

  return (
    <Card className="p-8 bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 border-0 shadow-2xl rounded-3xl">
      <div className="max-w-none">
        <div className="space-y-3">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent flex items-center justify-center gap-4">
              <span className="text-6xl animate-spin">🎪</span>
              Vamos Aprender Juntos!
              <span className="text-6xl animate-bounce">🎈</span>
            </h1>
            <p className="text-2xl font-semibold text-purple-600 mt-4">
              ✨ Prepare-se para uma aventura incrível! ✨
            </p>
          </div>
          
          <div className="space-y-4">
            {formatContent(content)}
          </div>
          
          <div className="text-center mt-10 p-8 bg-gradient-to-r from-green-200 via-blue-200 to-purple-200 rounded-3xl shadow-xl border-4 border-rainbow-300">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-5xl animate-bounce">🏆</span>
              <h2 className="text-3xl font-bold text-purple-700">
                Parabéns, Campeão!
              </h2>
              <span className="text-5xl animate-bounce">🎉</span>
            </div>
            <p className="text-xl font-bold text-purple-600">
              Você leu tudo! Agora está pronto para os desafios! 🚀
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ResumoContent;
