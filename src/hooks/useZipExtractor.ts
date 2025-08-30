import { useCallback } from 'react';
import JSZip from 'jszip';

export interface ExtractedImage {
  file: File;
  originalPath: string;
  isFromZip: boolean;
}

export const useZipExtractor = () => {
  const extractFromZip = useCallback(async (zipFile: File): Promise<ExtractedImage[]> => {
    console.log(`📦 Starting ZIP extraction: ${zipFile.name}`);
    
    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(zipFile);
      const extractedImages: ExtractedImage[] = [];
      
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];
      
      // Coletar todos os arquivos de imagem
      const imageFiles: { path: string; entry: JSZip.JSZipObject }[] = [];
      
      for (const [path, entry] of Object.entries(zipContent.files)) {
        if (!entry.dir && imageExtensions.some(ext => path.toLowerCase().endsWith(ext))) {
          imageFiles.push({ path, entry });
        }
      }
      
      // Ordenar por caminho (para manter ordem sequencial)
      imageFiles.sort((a, b) => {
        // Extrair números do nome do arquivo para ordenação natural
        const aNum = extractNumbers(a.path);
        const bNum = extractNumbers(b.path);
        
        if (aNum !== null && bNum !== null) {
          return aNum - bNum;
        }
        
        // Fallback para ordenação alfabética
        return a.path.localeCompare(b.path);
      });
      
      console.log(`📄 Found ${imageFiles.length} images in ZIP, processing in order...`);
      
      // Extrair cada imagem
      for (const { path, entry } of imageFiles) {
        try {
          console.log(`🖼️ Extracting: ${path}`);
          
          const blob = await entry.async('blob');
          const extension = path.toLowerCase().split('.').pop() || 'jpg';
          const mimeType = getMimeTypeFromExtension(extension);
          
          // Criar nome limpo para o arquivo
          const fileName = path.split('/').pop() || `image_${extractedImages.length + 1}.${extension}`;
          const cleanName = cleanFileName(fileName);
          
          const imageFile = new File([blob], cleanName, { type: mimeType });
          
          extractedImages.push({
            file: imageFile,
            originalPath: path,
            isFromZip: true
          });
          
          console.log(`✅ Extracted: ${cleanName} (${(imageFile.size / 1024).toFixed(2)}KB)`);
          
        } catch (error) {
          console.error(`❌ Error extracting ${path}:`, error);
          // Continue with other files even if one fails
        }
      }
      
      console.log(`📦 ZIP extraction complete: ${extractedImages.length}/${imageFiles.length} images extracted`);
      return extractedImages;
      
    } catch (error) {
      console.error('❌ ZIP extraction failed:', error);
      throw new Error(`Erro ao extrair arquivo ZIP: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }, []);

  const validateZipContainsImages = useCallback(async (zipFile: File): Promise<boolean> => {
    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(zipFile);
      
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];
      
      for (const [path, entry] of Object.entries(zipContent.files)) {
        if (!entry.dir && imageExtensions.some(ext => path.toLowerCase().endsWith(ext))) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error validating ZIP:', error);
      return false;
    }
  }, []);

  return {
    extractFromZip,
    validateZipContainsImages
  };
};

// Função auxiliar para extrair números de um nome de arquivo
const extractNumbers = (path: string): number | null => {
  const fileName = path.split('/').pop() || '';
  const numberMatch = fileName.match(/(\d+)/);
  return numberMatch ? parseInt(numberMatch[1], 10) : null;
};

// Função auxiliar para determinar o tipo MIME
const getMimeTypeFromExtension = (extension: string): string => {
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'gif': 'image/gif',
    'bmp': 'image/bmp'
  };
  
  return mimeTypes[extension.toLowerCase()] || 'image/jpeg';
};

// Função auxiliar para limpar nomes de arquivos
const cleanFileName = (fileName: string): string => {
  return fileName
    .replace(/[^\w\s.-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '_') // Substitui espaços por underscore
    .toLowerCase();
};