
import React from 'react';
import { Card } from '@/components/ui/card';

interface ResumoContentProps {
  content: string;
}

const ResumoContent = ({ content }: ResumoContentProps) => {
  // Função para processar e formatar o conteúdo do resumo
  const formatContent = (text: string) => {
    // Limpar o texto removendo símbolos # e formatando para crianças
    let cleanText = text
      .replace(/#{1,6}\s*/g, '') // Remove # símbolos
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
      .replace(/\*(.*?)\*/g, '$1'); // Remove markdown italic

    const lines = cleanText.split('\n');
    const formattedLines: JSX.Element[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        formattedLines.push(<br key={index} />);
        return;
      }

      // Títulos principais (linhas curtas e em maiúsculas ou que terminam com :)
      if (trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length < 50 && !trimmedLine.includes('.') ||
          trimmedLine.endsWith(':')) {
        formattedLines.push(
          <div key={index} className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 rounded-xl p-6 my-6 shadow-lg transform hover:scale-105 transition-all duration-300">
            <h2 className="text-2xl font-bold text-white text-center flex items-center justify-center gap-3">
              <span className="text-3xl">🌟</span>
              {trimmedLine.replace(/:$/, '')}
              <span className="text-3xl">🌟</span>
            </h2>
          </div>
        );
        return;
      }

      // Pontos de lista ou itens numerados
      if (/^[-*•]\s+/.test(trimmedLine) || /^\d+[\.)]\s+/.test(trimmedLine)) {
        formattedLines.push(
          <div key={index} className="flex items-start gap-4 my-4 p-4 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg border-l-4 border-blue-400 shadow-md hover:shadow-lg transition-shadow">
            <span className="text-2xl flex-shrink-0">✨</span>
            <p className="text-gray-800 leading-relaxed text-lg font-medium">
              {trimmedLine.replace(/^[-*•]\s+/, '').replace(/^\d+[\.)]\s+/, '')}
            </p>
          </div>
        );
        return;
      }

      // Texto em aspas ou parênteses (citações importantes)
      if ((trimmedLine.startsWith('"') && trimmedLine.endsWith('"')) ||
          (trimmedLine.startsWith('(') && trimmedLine.endsWith(')'))) {
        formattedLines.push(
          <div key={index} className="bg-gradient-to-r from-yellow-100 to-orange-100 border-l-4 border-yellow-400 rounded-lg p-5 my-4 shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💡</span>
              <p className="text-orange-800 italic text-lg font-semibold">
                {trimmedLine.replace(/^["(]/, '').replace(/[")]$/, '')}
              </p>
            </div>
          </div>
        );
        return;
      }

      // Parágrafos normais
      formattedLines.push(
        <div key={index} className="bg-white rounded-lg p-5 my-3 shadow-sm border border-gray-100 hover:border-purple-200 transition-colors">
          <p className="text-gray-800 leading-relaxed text-lg flex items-start gap-3">
            <span className="text-xl flex-shrink-0 mt-1">📚</span>
            <span>{trimmedLine}</span>
          </p>
        </div>
      );
    });

    return formattedLines;
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-0 shadow-xl rounded-2xl">
      <div className="max-w-none">
        <div className="space-y-3">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
              <span className="text-5xl">🎓</span>
              Vamos Aprender!
              <span className="text-5xl">📖</span>
            </h1>
            <p className="text-xl font-semibold text-purple-600 mt-3">
              Leia com atenção e prepare-se para o quiz! 🚀
            </p>
          </div>
          
          <div className="space-y-4">
            {formatContent(content)}
          </div>
          
          <div className="text-center mt-8 p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl shadow-lg border-2 border-green-300">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-4xl">🏆</span>
              <h2 className="text-2xl font-bold text-green-700">
                Parabéns! Você terminou de ler!
              </h2>
              <span className="text-4xl">🎉</span>
            </div>
            <p className="text-lg font-semibold text-green-600">
              Agora você está pronto para o desafio do quiz! 💪
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ResumoContent;
