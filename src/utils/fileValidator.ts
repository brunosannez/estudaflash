export const validateFiles = (files: File[]) => {
  if (!files || files.length === 0) {
    throw new Error('Nenhum arquivo selecionado');
  }

  if (files.length > 20) {
    throw new Error('Máximo de 20 imagens por upload');
  }

  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  for (const file of files) {
    // Verificar se é uma imagem
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      throw new Error(`Tipo de arquivo não suportado: ${file.name}. Use JPG, PNG, WebP ou GIF.`);
    }

    // Verificar tamanho
    if (file.size > maxFileSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      throw new Error(`Arquivo muito grande: ${file.name} (${fileSizeMB}MB). Máximo: 10MB por imagem.`);
    }

    // Verificar se não está vazio (mínimo 1KB)
    if (file.size < 1024) {
      throw new Error(`Arquivo muito pequeno: ${file.name} (${file.size} bytes). Mínimo: 1KB.`);
    }
  }

  console.log(`✅ ${files.length} imagem(ns) validada(s) com sucesso`);
};