
export interface ImageUploadResult {
  file: File;
  status: 'pending' | 'uploading' | 'extracting' | 'completed' | 'error';
  imageUrl?: string;
  extractedText?: string;
  error?: string;
}

export interface SuccessfulUploadResult extends ImageUploadResult {
    status: 'completed';
    imageUrl: string;
    extractedText: string;
}
