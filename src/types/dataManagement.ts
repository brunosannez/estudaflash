
export interface DataManagementStats {
  totalFiles: number;
  totalStorageMB: number;
  averageStoragePerUser: number;
  totalUsers: number;
  filesOlderThan30Days: number;
  filesOlderThan7Days: number;
  activeUsers30Days: number;
  largestFileSizeMB: number;
  storageByPlan: Record<string, {
    storage_mb: number;
    user_count: number;
    file_count: number;
  }>;
}

export interface CleanupResult {
  deletedFiles: number;
  freedStorageMB: number;
}
