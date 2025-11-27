import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { OCRResult } from './useSequentialOCR';

export interface SummaryResult {
  id: string;
  summary: string;
  metadata: {
    totalImages: number;
    totalPages: number;
    originalFileName: string;
    createdAt: string;
  };
}

export const useSummaryGenerator = () => {
  const { user } = useAuth();

  const generateSummary = useCallback(async (
    combinedText: string,
    ocrResults: OCRResult[]
  ): Promise<SummaryResult> => {
    console.log('📝 Starting summary generation...');
    
    // Validar texto mínimo
    const minTextLength = 50;
    if (combinedText.trim().length < minTextLength) {
      throw new Error(`Texto muito curto para gerar resumo (mínimo ${minTextLength} caracteres). Verifique se as imagens contêm texto legível.`);
    }
    
    // Validar que há pelo menos uma página com texto
    const pagesWithText = ocrResults.filter(r => r.extractedText && r.extractedText.trim().length > 20);
    if (pagesWithText.length === 0) {
      throw new Error('Nenhuma página com texto suficiente foi detectada. Certifique-se de que as imagens estão nítidas e contêm texto legível.');
    }
    
    console.log(`✅ Validation passed: ${pagesWithText.length} pages with text`);
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    if (!combinedText.trim()) {
      throw new Error('Nenhum texto disponível para gerar resumo');
    }

    try {
      console.log(`📄 Generating summary from ${combinedText.length} characters of text`);

      // Chamar a função de geração de resumo com parâmetros corretos
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: {
          extractedText: combinedText, // Corrigido: usar extractedText
          userId: user.id,
          schoolYear: 'Ensino Médio', // Adicionar nível escolar
          totalImages: ocrResults.length,
          metadata: {
            totalImages: ocrResults.length,
            successfulImages: ocrResults.filter(r => r.success).length,
            sourceType: 'enhanced_upload',
            processingDate: new Date().toISOString()
          }
        }
      });

      if (!data?.success) {
        console.error('❌ Summary generation error:', error);
        throw new Error(`Erro na geração do resumo: ${data?.fallbackMessage || error?.message || 'Erro desconhecido'}`);
      }

      if (!data?.resumo && !data?.summary) {
        throw new Error('Resumo não foi gerado corretamente');
      }

      const generatedSummary = data.resumo?.resumo_gerado || data.summary;
      console.log(`✅ Summary generated successfully: ${generatedSummary.length} characters`);

      // Para enhanced upload, o resumo já foi salvo pela edge function
      return {
        id: data.resumo?.id || 'enhanced_upload',
        summary: generatedSummary,
        metadata: {
          totalImages: ocrResults.length,
          totalPages: ocrResults.filter(r => r.success).length,
          originalFileName: `Upload_${ocrResults.length}_imagens`,
          createdAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ Summary generation failed:', error);
      throw new Error(`Falha na geração do resumo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }, [user]);

  const saveUploadRecord = useCallback(async (
    ocrResults: OCRResult[],
    summary: string
  ) => {
    if (!user) throw new Error('Usuário não autenticado');

    console.log('💾 Saving upload record to database...');

    // Combinar todos os textos extraídos
    const combinedText = ocrResults
      .filter(result => result.success && result.extractedText)
      .map((result, index) => {
        const pageNum = index + 1;
        return `=== PÁGINA ${pageNum} ===\n${result.extractedText}\n`;
      })
      .join('\n');

    // Calcular estatísticas
    const totalSize = ocrResults.reduce((acc, result) => acc + (result.fileName?.length || 0), 0);
    const successfulImages = ocrResults.filter(r => r.success);

    // Salvar registro principal de upload
    const { data: uploadData, error: uploadError } = await supabase
      .from('uploads')
      .insert({
        user_id: user.id,
        arquivo_original_nome: `Enhanced_Upload_${ocrResults.length}_images.json`,
        texto_extraido: combinedText,
        file_size: totalSize,
        imagem_url: successfulImages[0]?.imageUrl || '',
        data_upload: new Date().toISOString()
      })
      .select()
      .single();

    if (uploadError) {
      console.error('❌ Error saving upload record:', uploadError);
      throw new Error(`Erro ao salvar registro: ${uploadError.message}`);
    }

    console.log('✅ Upload record saved:', uploadData.id);

    // Salvar o resumo
    const { data: resumoData, error: resumoError } = await supabase
      .from('resumos')
      .insert({
        upload_id: uploadData.id,
        resumo_gerado: summary,
        custom_name: `Resumo - ${ocrResults.length} páginas`,
        data_criacao: new Date().toISOString()
      })
      .select()
      .single();

    if (resumoError) {
      console.error('❌ Error saving summary:', resumoError);
      throw new Error(`Erro ao salvar resumo: ${resumoError.message}`);
    }

    console.log('✅ Summary saved:', resumoData.id);

    return uploadData;
  }, [user]);

  return {
    generateSummary
  };
};