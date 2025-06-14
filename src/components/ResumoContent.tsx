
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
          <div key={index} className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl p-4 my-6 shadow-lg">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              {trimmedLine.replace(/^#+\s*/, '')}
            </h2>
          </div>
        );
        return;
      }

      // Subtítulos (linhas que começam com ## ou terminam com :)
      if (trimmedLine.startsWith('##') || trimmedLine.endsWith(':')) {
        formattedLines.push(
          <div key={index} className="bg-gradient-to-r from-blue-300 to-cyan-300 rounded-lg p-3 my-4 shadow-md">
            <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
              <span className="text-xl">⭐</span>
              {trimmedLine.replace(/^#+\s*/, '').replace(/:$/, '')}
            </h3>
          </div>
        );
        return;
      }

      // Pontos de lista (linhas que começam com -, *, •, ou números)
      if (/^[-*•]\s+/.test(trimmedLine) || /^\d+\.\s+/.test(trimmedLine)) {
        formattedLines.push(
          <div key={index} className="flex items-start gap-3 my-3 ml-4 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
            <span className="text-2xl mt-1">🌟</span>
            <p className="text-gray-800 leading-relaxed text-lg font-medium">
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
          <div key={index} className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-xl p-4 my-4 shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💡</span>
              <p className="text-green-800 italic text-lg font-medium">
                {trimmedLine.replace(/^["(]/, '').replace(/[")]$/, '')}
              </p>
            </div>
          </div>
        );
        return;
      }

      // Parágrafos normais
      formattedLines.push(
        <div key={index} className="bg-white rounded-lg p-4 my-3 shadow-sm border border-gray-200">
          <p className="text-gray-800 leading-relaxed text-lg flex items-start gap-3">
            <span className="text-xl mt-1">📚</span>
            {trimmedLine}
          </p>
        </div>
      );
    });

    return formattedLines;
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-rainbow-100 via-white to-rainbow-50 border-0 shadow-xl">
      <div className="prose prose-lg max-w-none">
        <div className="space-y-2">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-purple-600 flex items-center justify-center gap-3">
              <span className="text-4xl">🎪</span>
              Vamos Aprender Juntos!
              <span className="text-4xl">🎈</span>
            </h1>
          </div>
          {formatContent(content)}
          <div className="text-center mt-8 p-4 bg-gradient-to-r from-pink-200 to-purple-200 rounded-xl">
            <p className="text-purple-700 font-bold text-lg flex items-center justify-center gap-2">
              <span className="text-2xl">🏆</span>
              Parabéns! Você leu tudo!
              <span className="text-2xl">🎉</span>
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ResumoContent;
