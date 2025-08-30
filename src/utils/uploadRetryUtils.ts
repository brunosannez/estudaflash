/**
 * Utility functions for upload retry logic and error handling
 */

export const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

export const isRetryableError = (error: Error): boolean => {
  const retryableErrors = [
    'network',
    'timeout',
    'connection',
    'fetch',
    'AbortError',
    '500',
    '502',
    '503',
    '504',
    'temporariamente indisponível'
  ];
  
  return retryableErrors.some(errorType => 
    error.message.toLowerCase().includes(errorType.toLowerCase())
  );
};

export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000,
  operationName: string = 'operation'
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`🔄 ${operationName} - Attempt ${attempt}/${maxAttempts}`);
      const result = await operation();
      
      if (attempt > 1) {
        console.log(`✅ ${operationName} succeeded on attempt ${attempt}`);
      }
      
      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ ${operationName} failed on attempt ${attempt}:`, error);
      
      if (attempt === maxAttempts) {
        console.error(`💥 ${operationName} failed after ${maxAttempts} attempts`);
        throw lastError;
      }
      
      if (!isRetryableError(lastError)) {
        console.log(`⚠️ ${operationName} error is not retryable, stopping attempts`);
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await sleep(delay);
    }
  }
  
  throw lastError!;
};

export const getErrorCategory = (error: Error): 'network' | 'auth' | 'quota' | 'format' | 'server' | 'unknown' => {
  const message = error.message.toLowerCase();
  
  if (message.includes('créditos') || message.includes('quota') || message.includes('limit')) {
    return 'quota';
  }
  
  if (message.includes('autenticação') || message.includes('auth') || message.includes('login')) {
    return 'auth';
  }
  
  if (message.includes('network') || message.includes('connection') || message.includes('fetch')) {
    return 'network';
  }
  
  if (message.includes('formato') || message.includes('invalid') || message.includes('format')) {
    return 'format';
  }
  
  if (message.includes('500') || message.includes('502') || message.includes('503') || message.includes('504')) {
    return 'server';
  }
  
  return 'unknown';
};

export const getErrorMessage = (error: Error, context: string = ''): string => {
  const category = getErrorCategory(error);
  const contextPrefix = context ? `${context}: ` : '';
  
  switch (category) {
    case 'network':
      return `${contextPrefix}Erro de conexão. Verifique sua internet e tente novamente.`;
    case 'auth':
      return `${contextPrefix}Sessão expirada. Faça login novamente.`;
    case 'quota':
      return `${contextPrefix}${error.message}`; // Pass quota errors as-is
    case 'format':
      return `${contextPrefix}Formato de arquivo inválido. Use JPG, PNG, WebP ou GIF.`;
    case 'server':
      return `${contextPrefix}Serviço temporariamente indisponível. Tente novamente em alguns minutos.`;
    default:
      return `${contextPrefix}${error.message}`;
  }
};