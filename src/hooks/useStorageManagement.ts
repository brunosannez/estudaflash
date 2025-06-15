
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface StorageUsage {
  total_files: number;
  total_size_bytes: number;
  total_size_mb: number;
}

export const useStorageManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [storageUsage, setStorageUsage] = useState<StorageUsage | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStorageUsage = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_user_storage_usage', { user_uuid: user.id });
      
      if (error) {
        console.error('Erro ao buscar uso de storage:', error);
        throw error;
      }
      
      if (data && Array.isArray(data) && data.length > 0) {
        setStorageUsage({
          total_files: Number(data[0].total_files),
          total_size_bytes: Number(data[0].total_size_bytes),
          total_size_mb: Number(data[0].total_size_mb),
        });
      } else {
        setStorageUsage({
          total_files: 0,
          total_size_bytes: 0,
          total_size_mb: 0,
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados de storage:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar informações de armazenamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStorageLimitForPlan = (plan: string): number => {
    switch (plan) {
      case 'free':
        return 100; // 100MB
      case 'pro':
        return 1000; // 1GB
      case 'edu':
        return 5000; // 5GB
      default:
        return 100;
    }
  };

  const getStoragePercentage = (usageMB: number, plan: string): number => {
    const limit = getStorageLimitForPlan(plan);
    return Math.min((usageMB / limit) * 100, 100);
  };

  const isStorageNearLimit = (usageMB: number, plan: string): boolean => {
    return getStoragePercentage(usageMB, plan) >= 80;
  };

  const isStorageAtLimit = (usageMB: number, plan: string): boolean => {
    return getStoragePercentage(usageMB, plan) >= 100;
  };

  useEffect(() => {
    fetchStorageUsage();
  }, [user]);

  return {
    storageUsage,
    loading,
    fetchStorageUsage,
    getStorageLimitForPlan,
    getStoragePercentage,
    isStorageNearLimit,
    isStorageAtLimit,
  };
};
