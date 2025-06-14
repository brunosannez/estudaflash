
import { useState } from 'react';
import type { ImageUploadResult } from '@/types/upload';

export const useMultipleUploadState = () => {
  const [uploadResults, setUploadResults] = useState<ImageUploadResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const initializeResults = (files: File[]) => {
    const initialResults: ImageUploadResult[] = files.map(file => ({
      file,
      status: 'pending'
    }));
    setUploadResults(initialResults);
  };

  const updateResult = (index: number, newResult: Partial<ImageUploadResult>) => {
    setUploadResults(prev => prev.map((result, i) =>
      i === index ? { ...result, ...newResult } : result
    ));
  };
  
  const resetUpload = () => {
    console.log('🔄 Resetting upload state');
    setUploadResults([]);
    setIsProcessing(false);
  };

  return {
    uploadResults,
    isProcessing,
    setIsProcessing,
    initializeResults,
    updateResult,
    resetUpload,
  };
};
