
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface ResumoContentProps {
  content: string;
}

const ResumoContent = ({ content }: ResumoContentProps) => {
  // Split content into sections based on markdown-like headers
  const formatContent = (text: string) => {
    const lines = text.split('\n');
    const formattedLines = lines.map((line, index) => {
      // Headers (lines starting with #)
      if (line.startsWith('# ')) {
        return (
          <h1 key={index} className="text-2xl font-bold mt-6 mb-3 text-blue-800">
            {line.substring(2)}
          </h1>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="text-xl font-semibold mt-5 mb-2 text-blue-700">
            {line.substring(3)}
          </h2>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="text-lg font-medium mt-4 mb-2 text-blue-600">
            {line.substring(4)}
          </h3>
        );
      }
      
      // Bullet points
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return (
          <li key={index} className="ml-4 mb-1 text-gray-700">
            {line.substring(2)}
          </li>
        );
      }
      
      // Bold text
      if (line.includes('**')) {
        const parts = line.split('**');
        const formatted = parts.map((part, i) => 
          i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-900">{part}</strong> : part
        );
        return (
          <p key={index} className="mb-3 text-gray-700 leading-relaxed">
            {formatted}
          </p>
        );
      }
      
      // Empty lines
      if (line.trim() === '') {
        return <br key={index} />;
      }
      
      // Regular paragraphs
      return (
        <p key={index} className="mb-3 text-gray-700 leading-relaxed">
          {line}
        </p>
      );
    });
    
    return formattedLines;
  };

  return (
    <Card className="overflow-hidden shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          Conteúdo do Resumo
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-8">
        <div className="prose prose-lg max-w-none">
          {formatContent(content)}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumoContent;
