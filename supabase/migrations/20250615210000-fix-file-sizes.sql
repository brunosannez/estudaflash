
-- Corrigir file_size zerado para uploads existentes
-- Como não podemos recuperar o tamanho real dos arquivos já processados,
-- vamos estimar com base no comprimento do texto extraído

UPDATE public.uploads 
SET file_size = CASE 
  -- Estimar tamanho baseado no texto extraído (aproximadamente 1KB por 500 caracteres de texto)
  WHEN LENGTH(texto_extraido) > 0 THEN 
    GREATEST(
      LENGTH(texto_extraido) * 2, -- Mínimo 2 bytes por caractere
      102400 -- Mínimo 100KB para qualquer imagem
    )
  -- Se não há texto, assumir um tamanho padrão de imagem pequena
  ELSE 524288 -- 512KB padrão
END
WHERE file_size IS NULL OR file_size = 0;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.uploads.file_size IS 'Tamanho do arquivo em bytes. Para uploads anteriores a esta migração, valores foram estimados baseados no conteúdo extraído.';
