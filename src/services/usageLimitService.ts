
import { PlanType } from '@/types/plans';

// Re-export types and constants for backwards compatibility
export type { UsageData } from './usageDataService';
export type { ActionType } from './usageLimitsConfig';
export { USAGE_LIMITS } from './usageLimitsConfig';

// Re-export services
export { UsageDataService } from './usageDataService';
export { UsageValidationService } from './usageValidationService';
export { UsageIncrementService } from './usageIncrementService';
export { UsageLimitsConfig } from './usageLimitsConfig';

// Main service that combines all functionality
export class UsageLimitService {
  // Delegate to UsageDataService
  static async getUserUsage(userId: string) {
    return UsageDataService.getUserUsage(userId);
  }

  static async initializeUserUsage(userId: string) {
    return UsageDataService.initializeUserUsage(userId);
  }

  // Delegate to UsageValidationService
  static async checkLimit(userId: string, actionType: import('./usageLimitsConfig').ActionType) {
    return UsageValidationService.checkLimit(userId, actionType);
  }

  // Delegate to UsageIncrementService
  static async incrementUsage(userId: string, actionType: import('./usageLimitsConfig').ActionType) {
    return UsageIncrementService.incrementUsage(userId, actionType);
  }

  // Delegate to UsageLimitsConfig
  static getLimitMessage(actionType: import('./usageLimitsConfig').ActionType, plan: PlanType) {
    return UsageLimitsConfig.getLimitMessage(actionType, plan);
  }

  static getUpgradeMessage(plan: PlanType) {
    return UsageLimitsConfig.getUpgradeMessage(plan);
  }
}
