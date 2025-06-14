
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
          <h2 key={index} className="text-xl font-bold text-blue-800 mt-6 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            {trimmedLine.replace(/^#+\s*/, '')}
          </h2>
        );
        return;
      }

      // Subtítulos (linhas que começam com ## ou terminam com :)
      if (trimmedLine.startsWith('##') || trimmedLine.endsWith(':')) {
        formattedLines.push(
          <h3 key={index} className="text-lg font-semibold text-green-700 mt-4 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            {trimmedLine.replace(/^#+\s*/, '').replace(/:$/, '')}
          </h3>
        );
        return;
      }

      // Pontos de lista (linhas que começam com -, *, •, ou números)
      if (/^[-*•]\s+/.test(trimmedLine) || /^\d+\.\s+/.test(trimmedLine)) {
        formattedLines.push(
          <div key={index} className="flex items-start gap-3 my-2 ml-4">
            <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
            <p className="text-gray-700 leading-relaxed">
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
          <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 p-3 my-3 rounded-r-lg">
            <p className="text-gray-700 italic">
              {trimmedLine.replace(/^["(]/, '').replace(/[")]$/, '')}
            </p>
          </div>
        );
        return;
      }

      // Parágrafos normais
      formattedLines.push(
        <p key={index} className="text-gray-700 leading-relaxed my-2">
          {trimmedLine}
        </p>
      );
    });

    return formattedLines;
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-white to-blue-50/30 border-0 shadow-lg">
      <div className="prose prose-lg max-w-none">
        <div className="space-y-1">
          {formatContent(content)}
        </div>
      </div>
    </Card>
  );
};

export default ResumoContent;
