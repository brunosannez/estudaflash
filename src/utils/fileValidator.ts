
export const validateFiles = (files: File[]) => {
    const invalidFiles = files.filter(file => 
      !file.type.startsWith('image/') && 
      !file.type.includes('zip') && 
      file.type !== 'application/zip' &&
      file.type !== 'application/x-zip-compressed'
    );
    
    if (invalidFiles.length > 0) {
      console.error('❌ Invalid files found:', invalidFiles.map(f => f.name));
      throw new Error(`Arquivos inválidos: ${invalidFiles.map(f => f.name).join(', ')}. Apenas imagens e arquivos ZIP são aceitos.`);
    }

    for (const file of files) {
        const fileSizeInMB = file.size / (1024 * 1024);
        
        // Larger size limit for ZIP files
        const maxSize = file.type.includes('zip') ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB for ZIP, 10MB for images
        
        if (file.size > maxSize) {
            const maxSizeMB = maxSize / (1024 * 1024);
            throw new Error(`Arquivo ${file.name} é muito grande (${fileSizeInMB.toFixed(2)}MB). Tamanho máximo: ${maxSizeMB}MB`);
        }
        
        // Additional validation for very small files
        if (file.size < 1024) { // 1KB
            throw new Error(`Arquivo ${file.name} é muito pequeno (${file.size} bytes). Mínimo: 1KB`);
        }
        
        // Check file type more specifically
        const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        const allowedZipTypes = ['application/zip', 'application/x-zip-compressed'];
        
        const isValidImage = allowedImageTypes.includes(file.type.toLowerCase());
        const isValidZip = allowedZipTypes.includes(file.type.toLowerCase()) || file.type.includes('zip');
        
        if (!isValidImage && !isValidZip) {
            throw new Error(`Tipo de arquivo não suportado: ${file.type}. Tipos aceitos: JPG, PNG, WebP, GIF, ZIP`);
        }
    }
    
    console.log(`✅ File validation passed for ${files.length} files`);
}
