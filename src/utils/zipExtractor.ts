import JSZip from 'jszip';

export interface ExtractedImage {
  file: File;
  originalPath: string;
  isFromZip: boolean;
}

/**
 * Extrai imagens de arquivos ZIP
 */
export const extractImagesFromZip = async (zipFile: File): Promise<ExtractedImage[]> => {
  console.log(`📦 Extraindo imagens do arquivo ZIP: ${zipFile.name}`);
  
  const zip = new JSZip();
  const zipContent = await zip.loadAsync(zipFile);
  const extractedImages: ExtractedImage[] = [];
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  
  // Iterar sobre todos os arquivos no ZIP
  for (const [path, zipEntry] of Object.entries(zipContent.files)) {
    // Verificar se é um arquivo (não pasta) e se é uma imagem
    if (!zipEntry.dir && imageExtensions.some(ext => path.toLowerCase().endsWith(ext))) {
      try {
        console.log(`🖼️ Extraindo imagem: ${path}`);
        
        // Extrair o conteúdo do arquivo como blob
        const blob = await zipEntry.async('blob');
        
        // Determinar o tipo MIME baseado na extensão
        const extension = path.toLowerCase().split('.').pop();
        const mimeType = getMimeTypeFromExtension(extension || '');
        
        // Criar um novo arquivo File
        const fileName = path.split('/').pop() || `image_${extractedImages.length + 1}`;
        const imageFile = new File([blob], fileName, { type: mimeType });
        
        extractedImages.push({
          file: imageFile,
          originalPath: path,
          isFromZip: true
        });
        
        console.log(`✅ Imagem extraída: ${fileName} (${(imageFile.size / 1024).toFixed(2)}KB)`);
      } catch (error) {
        console.error(`❌ Erro ao extrair imagem ${path}:`, error);
      }
    }
  }
  
  console.log(`📦 Extração completa: ${extractedImages.length} imagens extraídas de ${zipFile.name}`);
  return extractedImages;
};

/**
 * Processa uma lista de arquivos, extraindo imagens de ZIPs e mantendo imagens diretas
 */
export const processFilesAndExtractImages = async (files: File[]): Promise<ExtractedImage[]> => {
  const allImages: ExtractedImage[] = [];
  
  for (const file of files) {
    if (file.type.includes('zip')) {
      console.log(`📦 Processando arquivo ZIP: ${file.name}`);
      const extractedImages = await extractImagesFromZip(file);
      allImages.push(...extractedImages);
    } else if (file.type.startsWith('image/')) {
      console.log(`🖼️ Adicionando imagem direta: ${file.name}`);
      allImages.push({
        file,
        originalPath: file.name,
        isFromZip: false
      });
    }
  }
  
  // Ordenar imagens por nome para manter consistência
  allImages.sort((a, b) => a.originalPath.localeCompare(b.originalPath));
  
  console.log(`📁 Processamento completo: ${allImages.length} imagens prontas para upload`);
  return allImages;
};

/**
 * Determina o tipo MIME baseado na extensão do arquivo
 */
const getMimeTypeFromExtension = (extension: string): string => {
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'gif': 'image/gif'
  };
  
  return mimeTypes[extension.toLowerCase()] || 'image/jpeg';
};

/**
 * Valida se um arquivo ZIP contém pelo menos uma imagem
 */
export const validateZipContainsImages = async (zipFile: File): Promise<boolean> => {
  try {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(zipFile);
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    
    for (const [path, zipEntry] of Object.entries(zipContent.files)) {
      if (!zipEntry.dir && imageExtensions.some(ext => path.toLowerCase().endsWith(ext))) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Erro ao validar ZIP:', error);
    return false;
  }
};