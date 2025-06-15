
import type { DataManagementStats } from '@/types/dataManagement';

export class DataManagementCacheService {
  private static cache: {
    stats: DataManagementStats | null;
    timestamp: number;
  } = { stats: null, timestamp: 0 };

  private static CACHE_DURATION = 30000; // 30 segundos

  static isValid(): boolean {
    const now = Date.now();
    return this.cache.stats !== null && (now - this.cache.timestamp) < this.CACHE_DURATION;
  }

  static get(): DataManagementStats | null {
    if (this.isValid()) {
      console.log('📊 DataManagement Cache: Usando dados do cache');
      return this.cache.stats;
    }
    return null;
  }

  static set(stats: DataManagementStats): void {
    this.cache = {
      stats,
      timestamp: Date.now()
    };
  }

  static invalidate(): void {
    this.cache.timestamp = 0;
    console.log('🔄 DataManagement Cache: Cache invalidado');
  }
}
