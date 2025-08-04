-- CORREÇÃO DE SEGURANÇA: Adicionar search_path às functions existentes
-- Esta migração corrige os warnings de segurança do Supabase Linter

-- 1. Corrigir search_path nas functions existentes
ALTER FUNCTION public.calculate_next_review_date(numeric, integer, integer) SET search_path = 'public';
ALTER FUNCTION public.get_flashcards_due_for_review(uuid) SET search_path = 'public';
ALTER FUNCTION public.calculate_quiz_performance_score(integer, integer, integer, integer, integer) SET search_path = 'public';
ALTER FUNCTION public.analyze_quiz_weak_topics(uuid, integer) SET search_path = 'public';
ALTER FUNCTION public.update_daily_quiz_stats(uuid) SET search_path = 'public';
ALTER FUNCTION public.check_and_award_quiz_badges(uuid) SET search_path = 'public';
ALTER FUNCTION public.add_admin_by_email(text) SET search_path = 'public';
ALTER FUNCTION public.admin_reset_user_usage(uuid) SET search_path = 'public';
ALTER FUNCTION public.admin_toggle_user_status(uuid, boolean) SET search_path = 'public';
ALTER FUNCTION public.admin_promote_user(text) SET search_path = 'public';
ALTER FUNCTION public.check_user_is_admin(uuid) SET search_path = 'public';
ALTER FUNCTION public.check_username_available(text) SET search_path = 'public';
ALTER FUNCTION public.get_user_usage_summary(uuid) SET search_path = 'public';
ALTER FUNCTION public.get_user_storage_usage(uuid) SET search_path = 'public';
ALTER FUNCTION public.get_user_plan_details(uuid) SET search_path = 'public';
ALTER FUNCTION public.get_usage_analytics(date, date) SET search_path = 'public';
ALTER FUNCTION public.reset_monthly_usage() SET search_path = 'public';
ALTER FUNCTION public.is_current_user_admin() SET search_path = 'public';
ALTER FUNCTION public.is_admin(uuid) SET search_path = 'public';
ALTER FUNCTION public.get_admin_dashboard_stats() SET search_path = 'public';
ALTER FUNCTION public.admin_change_user_plan(uuid, text) SET search_path = 'public';
ALTER FUNCTION public.admin_change_user_plan_new(uuid, uuid) SET search_path = 'public';
ALTER FUNCTION public.admin_create_plan(text, text, numeric, numeric, integer, integer, integer, integer, text, text, text, text[], boolean) SET search_path = 'public';
ALTER FUNCTION public.admin_delete_user_data(uuid) SET search_path = 'public';
ALTER FUNCTION public.admin_update_plan(uuid, numeric, numeric, integer, integer, integer, integer, text, text, text, boolean) SET search_path = 'public';
ALTER FUNCTION public.admin_update_plan(uuid, numeric, numeric, integer, integer, integer, integer, text, text, text, boolean, text[], text, boolean) SET search_path = 'public';
ALTER FUNCTION public.cleanup_old_files(integer) SET search_path = 'public';
ALTER FUNCTION public.get_active_plans() SET search_path = 'public';
ALTER FUNCTION public.get_all_users_admin() SET search_path = 'public';
ALTER FUNCTION public.get_data_management_stats() SET search_path = 'public';
ALTER FUNCTION public.get_enhanced_quiz_history(uuid) SET search_path = 'public';
ALTER FUNCTION public.log_usage(uuid, text, integer, jsonb) SET search_path = 'public';
ALTER FUNCTION public.trigger_update_quiz_stats() SET search_path = 'public';
ALTER FUNCTION public.update_quiz_session_progress() SET search_path = 'public';
ALTER FUNCTION public.handle_new_user_setup() SET search_path = 'public';