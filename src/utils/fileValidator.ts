
export const validateFiles = (files: File[]) => {
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      console.error('❌ Invalid files found:', invalidFiles.map(f => f.name));
      throw new Error(`Arquivos inválidos: ${invalidFiles.map(f => f.name).join(', ')}. Apenas imagens são aceitas.`);
    }

    for (const file of files) {
        const fileSizeInMB = file.size / (1024 * 1024);
        
        if (file.size > 10 * 1024 * 1024) { // 10MB
            throw new Error(`Arquivo ${file.name} é muito grande (${fileSizeInMB.toFixed(2)}MB). Tamanho máximo: 10MB`);
        }
        
        // Additional validation for very small files
        if (file.size < 1024) { // 1KB
            throw new Error(`Arquivo ${file.name} é muito pequeno (${file.size} bytes). Mínimo: 1KB`);
        }
        
        // Check file type more specifically
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type.toLowerCase())) {
            throw new Error(`Tipo de arquivo não suportado: ${file.type}. Tipos aceitos: JPG, PNG, WebP, GIF`);
        }
    }
    
    console.log(`✅ File validation passed for ${files.length} files`);
}
