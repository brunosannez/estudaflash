import { supabase } from '@/integrations/supabase/client';

export interface BatchSummaryData {
  batchId: string;
  batchNumber: number;
  totalBatches: number;
  images: Array<{
    originalName: string;
    extractedText: string;
    imageUrl: string;
  }>;
  partialSummary: string;
}

/**
 * Combina múltiplos resumos parciais em um resumo final completo
 */
export const combineBatchSummaries = async (
  userId: string,
  batchSummaries: BatchSummaryData[],
  originalTitle?: string
): Promise<string> => {
  console.log('🔄 Iniciando combinação de resumos em lotes:', {
    totalBatches: batchSummaries.length,
    totalImages: batchSummaries.reduce((sum, batch) => sum + batch.images.length, 0)
  });

  try {
    // Ordenar lotes por número para manter sequência
    const sortedBatches = batchSummaries.sort((a, b) => a.batchNumber - b.batchNumber);
    
    // Preparar dados para a IA
    const combinationPrompt = createCombinationPrompt(sortedBatches, originalTitle);
    
    // Chamar a função edge para combinar os resumos
    const { data, error } = await supabase.functions.invoke('generate-summary', {
      body: {
        extractedText: combinationPrompt,
        user_id: userId,
        isCombiningBatches: true,
        totalBatches: sortedBatches.length,
        totalImages: sortedBatches.reduce((sum, batch) => sum + batch.images.length, 0)
      }
    });

    if (error) {
      console.error('❌ Erro ao combinar resumos:', error);
      throw new Error(`Erro na combinação: ${error.message}`);
    }

    console.log('✅ Resumos combinados com sucesso');
    return data.summary;

  } catch (error) {
    console.error('❌ Erro no serviço de combinação:', error);
    throw error;
  }
};

/**
 * Cria o prompt para combinar múltiplos resumos parciais
 */
const createCombinationPrompt = (batches: BatchSummaryData[], originalTitle?: string): string => {
  const totalImages = batches.reduce((sum, batch) => sum + batch.images.length, 0);
  
  let prompt = `# COMBINAÇÃO DE RESUMOS EM LOTES\n\n`;
  
  if (originalTitle) {
    prompt += `**Título do Material:** ${originalTitle}\n\n`;
  }
  
  prompt += `**Contexto:** Este material foi processado em ${batches.length} lotes contendo ${totalImages} imagens no total. `;
  prompt += `Sua tarefa é combinar os resumos parciais em um resumo final coeso, organizado e completo.\n\n`;
  
  prompt += `## RESUMOS PARCIAIS POR LOTE:\n\n`;
  
  batches.forEach((batch, index) => {
    prompt += `### 📦 LOTE ${batch.batchNumber} de ${batch.totalBatches}\n`;
    prompt += `**Imagens processadas:** ${batch.images.length}\n`;
    prompt += `**Arquivos:** ${batch.images.map(img => img.originalName).join(', ')}\n\n`;
    prompt += `**Resumo do Lote:**\n${batch.partialSummary}\n\n`;
    
    if (index < batches.length - 1) {
      prompt += `---\n\n`;
    }
  });
  
  prompt += `\n## INSTRUÇÕES para o RESUMO FINAL:\n\n`;
  prompt += `1. **COMBINE** todos os resumos parciais em um texto fluido e organizado\n`;
  prompt += `2. **ORGANIZE** o conteúdo por temas/tópicos principais (não por lotes)\n`;
  prompt += `3. **ELIMINE** redundâncias e repetições entre os lotes\n`;
  prompt += `4. **MANTENHA** todas as informações importantes de cada lote\n`;
  prompt += `5. **ESTRUTURE** com títulos, subtítulos e bullet points para facilitar o estudo\n`;
  prompt += `6. **FOQUE** no que pode cair em provas e exames\n`;
  prompt += `7. **INCLUA** exemplos práticos e conceitos-chave mencionados em qualquer lote\n\n`;
  
  prompt += `**FORMATO FINAL:** Crie um resumo acadêmico completo, bem estruturado e otimizado para estudos, `;
  prompt += `que integre harmoniosamente todo o conteúdo dos ${batches.length} lotes processados.`;
  
  return prompt;
};

/**
 * Salva metadados sobre a combinação de lotes no banco
 */
export const saveBatchCombinationMetadata = async (
  userId: string,
  uploadId: string,
  batchesData: BatchSummaryData[],
  finalSummary: string
): Promise<void> => {
  try {
    const metadata = {
      totalBatches: batchesData.length,
      totalImages: batchesData.reduce((sum, batch) => sum + batch.images.length, 0),
      batchSizes: batchesData.map(b => b.images.length),
      combinedAt: new Date().toISOString(),
      summaryLength: finalSummary.length
    };

    // Você pode salvar esses metadados em uma tabela específica se necessário
    console.log('📊 Metadados da combinação de lotes:', metadata);
    
  } catch (error) {
    console.error('❌ Erro ao salvar metadados da combinação:', error);
    // Não falhar o processo principal por causa dos metadados
  }
};