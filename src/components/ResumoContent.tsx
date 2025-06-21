
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, BookOpen, Lightbulb, Star, Quote } from 'lucide-react';

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
          <div key={index} className="mb-6 mt-8 first:mt-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {line.substring(2)}
              </h1>
            </div>
            <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-32"></div>
          </div>
        );
      }
      
      if (line.startsWith('## ')) {
        return (
          <div key={index} className="mb-4 mt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center shadow-md">
                <Lightbulb className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-green-700 dark:text-green-400">
                {line.substring(3)}
              </h2>
            </div>
          </div>
        );
      }
      
      if (line.startsWith('### ')) {
        return (
          <div key={index} className="mb-3 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-md flex items-center justify-center">
                <Star className="h-3 w-3 text-white" />
              </div>
              <h3 className="text-xl font-medium text-orange-700 dark:text-orange-400">
                {line.substring(4)}
              </h3>
            </div>
          </div>
        );
      }
      
      // Bullet points with enhanced styling
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return (
          <div key={index} className="flex items-start gap-3 mb-3 ml-4">
            <div className="w-2 h-2 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {line.substring(2)}
            </p>
          </div>
        );
      }
      
      // Bold text with better highlighting
      if (line.includes('**')) {
        const parts = line.split('**');
        const formatted = parts.map((part, i) => 
          i % 2 === 1 ? (
            <span key={i} className="font-semibold bg-gradient-to-r from-yellow-200 to-yellow-300 dark:from-yellow-800 dark:to-yellow-700 px-1 py-0.5 rounded text-gray-900 dark:text-gray-100">
              {part}
            </span>
          ) : part
        );
        return (
          <p key={index} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
            {formatted}
          </p>
        );
      }
      
      // Empty lines
      if (line.trim() === '') {
        return <div key={index} className="h-3" />;
      }
      
      // Regular paragraphs with enhanced styling
      return (
        <div key={index} className="mb-4">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900 p-4 rounded-xl border-l-4 border-blue-400 shadow-sm">
            <Quote className="inline w-4 h-4 text-blue-500 mr-2" />
            {line}
          </p>
        </div>
      );
    });
    
    return formattedLines;
  };

  return (
    <div className="max-w-none">
      <Card className="overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950">
        <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <CardTitle className="flex items-center gap-4 text-3xl relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div>
              <span className="block text-3xl font-bold">Conteúdo do Resumo</span>
              <span className="block text-lg font-normal text-white/80 mt-1">Material de Estudo Organizado</span>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-8 relative">
          {/* Decorative side elements */}
          <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-blue-400 via-purple-400 to-indigo-400 rounded-r-full"></div>
          
          <div className="pl-6">
            <div className="prose prose-lg max-w-none">
              {formatContent(content)}
            </div>
          </div>

          {/* Bottom decorative element */}
          <div className="mt-8 pt-6 border-t border-gradient-to-r from-transparent via-gray-300 to-transparent">
            <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Resumo Gerado por IA</span>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-100"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumoContent;
