import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SecurityAuditEntry {
  action_type: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, any>;
}

export const useSecurityAudit = () => {
  const logSecurityEvent = useCallback(async (entry: SecurityAuditEntry) => {
    try {
      const { error } = await supabase.rpc('log_sensitive_access', {
        action_type_param: entry.action_type,
        resource_type_param: entry.resource_type,
        resource_id_param: entry.resource_id || null,
        details_param: entry.details || {}
      });

      if (error) {
        console.error('Error logging security event:', error);
      }
    } catch (error) {
      console.error('Security audit logging failed:', error);
      // Don't throw - security logging should never break app functionality
    }
  }, []);

  const logGuardianAccess = useCallback(async (targetUserId: string, reason: string) => {
    await logSecurityEvent({
      action_type: 'guardian_data_access',
      resource_type: 'guardian',
      resource_id: targetUserId,
      details: {
        access_reason: reason,
        timestamp: new Date().toISOString()
      }
    });
  }, [logSecurityEvent]);

  const logAdminAction = useCallback(async (action: string, targetResource: string, resourceId?: string) => {
    await logSecurityEvent({
      action_type: `admin_${action}`,
      resource_type: targetResource,
      resource_id: resourceId,
      details: {
        admin_action: action,
        timestamp: new Date().toISOString()
      }
    });
  }, [logSecurityEvent]);

  const logSuspiciousActivity = useCallback(async (activity: string, details: Record<string, any>) => {
    await logSecurityEvent({
      action_type: 'suspicious_activity',
      resource_type: 'security',
      details: {
        activity,
        suspicious: true,
        ...details,
        timestamp: new Date().toISOString()
      }
    });
  }, [logSecurityEvent]);

  const logPrivacyChange = useCallback(async (privacyLevel: string) => {
    await logSecurityEvent({
      action_type: 'privacy_level_change',
      resource_type: 'user_profile',
      details: {
        new_privacy_level: privacyLevel,
        timestamp: new Date().toISOString()
      }
    });
  }, [logSecurityEvent]);

  return {
    logSecurityEvent,
    logGuardianAccess,
    logAdminAction,
    logSuspiciousActivity,
    logPrivacyChange
  };
};