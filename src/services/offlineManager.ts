class OfflineManager {
  private static instance: OfflineManager;
  private isOnline = navigator.onLine;
  private pendingActions: Array<{ key: string; data: any; timestamp: number }> = [];
  private listeners: Set<(isOnline: boolean) => void> = new Set();

  static getInstance() {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  constructor() {
    this.setupEventListeners();
    this.loadPendingActions();
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners();
      this.syncPendingActions();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners();
    });
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.isOnline));
  }

  addListener(listener: (isOnline: boolean) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getOnlineStatus() {
    return this.isOnline;
  }

  // Cache data for offline use
  cacheData(key: string, data: any) {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now(),
        ttl: 24 * 60 * 60 * 1000 // 24 hours
      }));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  getCachedData(key: string) {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const { data, timestamp, ttl } = JSON.parse(cached);
      if (Date.now() - timestamp > ttl) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Failed to get cached data:', error);
      return null;
    }
  }

  // Queue actions for when back online
  queueAction(key: string, data: any) {
    const action = { key, data, timestamp: Date.now() };
    this.pendingActions.push(action);
    this.savePendingActions();
  }

  private savePendingActions() {
    try {
      localStorage.setItem('pending_actions', JSON.stringify(this.pendingActions));
    } catch (error) {
      console.warn('Failed to save pending actions:', error);
    }
  }

  private loadPendingActions() {
    try {
      const pending = localStorage.getItem('pending_actions');
      if (pending) {
        this.pendingActions = JSON.parse(pending);
      }
    } catch (error) {
      console.warn('Failed to load pending actions:', error);
    }
  }

  private async syncPendingActions() {
    if (!this.isOnline || this.pendingActions.length === 0) return;

    console.log(`🔄 Syncing ${this.pendingActions.length} pending actions...`);

    const actionsToSync = [...this.pendingActions];
    this.pendingActions = [];
    this.savePendingActions();

    for (const action of actionsToSync) {
      try {
        // Here you would implement the actual sync logic
        // For now, just log the action
        console.log('Syncing action:', action);
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API call
      } catch (error) {
        console.error('Failed to sync action:', error);
        // Re-queue failed actions
        this.pendingActions.push(action);
      }
    }

    this.savePendingActions();
  }

  clearCache() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
  }
}

export const useOfflineManager = () => {
  const offlineManager = OfflineManager.getInstance();
  const [isOnline, setIsOnline] = useState(offlineManager.getOnlineStatus());

  useState(() => {
    const unsubscribe = offlineManager.addListener(setIsOnline);
    return unsubscribe;
  });

  return {
    isOnline,
    cacheData: offlineManager.cacheData.bind(offlineManager),
    getCachedData: offlineManager.getCachedData.bind(offlineManager),
    queueAction: offlineManager.queueAction.bind(offlineManager),
    clearCache: offlineManager.clearCache.bind(offlineManager)
  };
};