/**
 * Input sanitization utilities for security
 */

// Basic XSS protection - strip HTML tags and dangerous content
export const sanitizeText = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove object tags
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '') // Remove embed tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick, onmouseover, etc.
    .trim();
};

// Validate display name
export const validateDisplayName = (displayName: string): { isValid: boolean; error?: string } => {
  if (!displayName) {
    return { isValid: false, error: 'Nome de exibição é obrigatório' };
  }

  if (displayName.length < 2) {
    return { isValid: false, error: 'Nome de exibição deve ter pelo menos 2 caracteres' };
  }

  if (displayName.length > 100) {
    return { isValid: false, error: 'Nome de exibição deve ter no máximo 100 caracteres' };
  }

  // Check for HTML tags
  if (/<[^>]*>/g.test(displayName)) {
    return { isValid: false, error: 'Nome de exibição não pode conter tags HTML' };
  }

  // Check for potentially malicious patterns
  const maliciousPatterns = [
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /<script/i,
    /on\w+\s*=/i
  ];

  for (const pattern of maliciousPatterns) {
    if (pattern.test(displayName)) {
      return { isValid: false, error: 'Nome de exibição contém conteúdo inválido' };
    }
  }

  return { isValid: true };
};

// Validate bio
export const validateBio = (bio: string): { isValid: boolean; error?: string } => {
  if (!bio) {
    return { isValid: true }; // Bio is optional
  }

  if (bio.length > 500) {
    return { isValid: false, error: 'Bio deve ter no máximo 500 caracteres' };
  }

  // Check for potentially malicious patterns
  const maliciousPatterns = [
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /<script/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /on\w+\s*=/i
  ];

  for (const pattern of maliciousPatterns) {
    if (pattern.test(bio)) {
      return { isValid: false, error: 'Bio contém conteúdo potencialmente malicioso' };
    }
  }

  return { isValid: true };
};

// Validate file names for uploads
export const validateFileName = (fileName: string): { isValid: boolean; sanitizedName: string; error?: string } => {
  if (!fileName) {
    return { isValid: false, sanitizedName: '', error: 'Nome do arquivo é obrigatório' };
  }

  // Remove path traversal attempts
  let sanitizedName = fileName
    .replace(/\.\./g, '') // Remove ..
    .replace(/[\/\\]/g, '') // Remove slashes
    .replace(/[<>:"|?*]/g, '') // Remove illegal characters
    .trim();

  // Check for executable extensions
  const dangerousExtensions = [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
    '.app', '.deb', '.pkg', '.dmg', '.sh', '.php', '.asp', '.aspx', '.jsp'
  ];

  const extension = sanitizedName.toLowerCase().substring(sanitizedName.lastIndexOf('.'));
  if (dangerousExtensions.includes(extension)) {
    return { isValid: false, sanitizedName, error: 'Tipo de arquivo não permitido' };
  }

  // Ensure minimum length after sanitization
  if (sanitizedName.length < 1) {
    return { isValid: false, sanitizedName, error: 'Nome do arquivo inválido após sanitização' };
  }

  // Limit length
  if (sanitizedName.length > 255) {
    sanitizedName = sanitizedName.substring(0, 255);
  }

  return { isValid: true, sanitizedName };
};

// Validate URLs
export const validateUrl = (url: string): { isValid: boolean; error?: string } => {
  if (!url) {
    return { isValid: true }; // URL is optional in most cases
  }

  try {
    const urlObject = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObject.protocol)) {
      return { isValid: false, error: 'Apenas URLs HTTP e HTTPS são permitidas' };
    }

    // Block localhost and internal IPs for security
    const hostname = urlObject.hostname;
    if (hostname === 'localhost' || 
        hostname.startsWith('127.') || 
        hostname.startsWith('192.168.') || 
        hostname.startsWith('10.') ||
        hostname.match(/^172\.(1[6-9]|2\d|3[01])\./)) {
      return { isValid: false, error: 'URLs internas não são permitidas' };
    }

    return { isValid: true };
  } catch {
    return { isValid: false, error: 'URL inválida' };
  }
};

// General input sanitizer for form fields
export const sanitizeFormInput = (input: string, maxLength: number = 1000): string => {
  if (!input) return '';
  
  let sanitized = sanitizeText(input);
  
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
};