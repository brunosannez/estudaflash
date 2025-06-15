
import React from 'react';
import PageLayout from '@/components/navigation/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload as UploadIcon, FileImage, Sparkles } from 'lucide-react';

const Upload = () => {
  return (
    <PageLayout showBackground>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <UploadIcon className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Upload de Imagens</h1>
          </div>
          <p className="text-lg text-gray-600">
            Faça upload de suas imagens de estudo para gerar resumos e flashcards automaticamente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-2 border-dashed border-purple-300 hover:border-purple-400 transition-colors cursor-pointer">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <FileImage className="h-6 w-6 text-purple-600" />
                Área de Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="py-12">
                <UploadIcon className="h-16 w-16 mx-auto text-purple-400 mb-4" />
                <p className="text-gray-600 mb-4">
                  Arraste e solte suas imagens aqui ou clique para selecionar
                </p>
                <Button className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700">
                  Selecionar Imagens
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Sparkles className="h-6 w-6" />
                Como Funciona
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Upload</h3>
                    <p className="text-sm text-gray-600">Faça upload de suas imagens de estudo</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Processamento</h3>
                    <p className="text-sm text-gray-600">IA extrai e analisa o conteúdo</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Geração</h3>
                    <p className="text-sm text-gray-600">Resumos e flashcards são criados automaticamente</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="text-4xl">💡</div>
              <div>
                <h3 className="font-semibold text-blue-800 mb-1">Dica</h3>
                <p className="text-blue-700">
                  Para melhores resultados, use imagens nítidas com texto legível. 
                  Formatos suportados: JPG, PNG, PDF
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Upload;
