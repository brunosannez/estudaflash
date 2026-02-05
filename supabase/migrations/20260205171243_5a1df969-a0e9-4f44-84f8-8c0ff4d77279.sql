-- =============================================
-- Security Fix: Create public view for plans
-- Hides internal pricing/cost data from regular users
-- =============================================

-- Create a public view that exposes only non-sensitive plan data
CREATE OR REPLACE VIEW public.public_plans AS
SELECT 
  id,
  name,
  description,
  features,
  is_active,
  uploads_limit,
  summaries_limit,
  flashcards_limit,
  quizzes_limit,
  credits_per_month,
  -- Only show prices (these are public for checkout), hide internal costs
  price_brl,
  price_brl_yearly,
  created_at,
  updated_at
FROM public.plans
WHERE is_active = true;

-- Grant access to authenticated users for the view
GRANT SELECT ON public.public_plans TO authenticated;

-- Add comment explaining the view
COMMENT ON VIEW public.public_plans IS 'Public view of plans that hides internal cost data (cost_per_1k_tokens_usd, credits_cost_brl, model configs). Use this view for frontend display.';

-- =============================================
-- Add input validation trigger for social_comments
-- =============================================

-- Create validation function for social comments
CREATE OR REPLACE FUNCTION validate_social_comment_input()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate content length
  IF length(NEW.content) > 2000 THEN
    RAISE EXCEPTION 'Comment content exceeds maximum length of 2000 characters';
  END IF;
  
  -- Block potentially malicious content patterns
  IF NEW.content ~* '<script|javascript:|data:|vbscript:|on\w+\s*=' THEN
    RAISE EXCEPTION 'Comment contains potentially malicious content';
  END IF;
  
  -- Block iframe/object/embed tags
  IF NEW.content ~* '<iframe|<object|<embed' THEN
    RAISE EXCEPTION 'Comment contains disallowed HTML elements';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for social_comments validation
DROP TRIGGER IF EXISTS validate_social_comment_trigger ON social_comments;
CREATE TRIGGER validate_social_comment_trigger
  BEFORE INSERT OR UPDATE ON social_comments
  FOR EACH ROW
  EXECUTE FUNCTION validate_social_comment_input();

-- =============================================
-- Add validation for upload file names (path traversal prevention)
-- =============================================

CREATE OR REPLACE FUNCTION validate_upload_filename()
RETURNS TRIGGER AS $$
BEGIN
  -- Remove path traversal attempts
  NEW.arquivo_original_nome := regexp_replace(NEW.arquivo_original_nome, '\.\.', '', 'g');
  NEW.arquivo_original_nome := regexp_replace(NEW.arquivo_original_nome, '[\/\\]', '', 'g');
  NEW.arquivo_original_nome := regexp_replace(NEW.arquivo_original_nome, '[<>:"|?*]', '', 'g');
  
  -- Ensure filename is not empty after sanitization
  IF length(trim(NEW.arquivo_original_nome)) < 1 THEN
    RAISE EXCEPTION 'Invalid filename after sanitization';
  END IF;
  
  -- Limit filename length
  IF length(NEW.arquivo_original_nome) > 255 THEN
    NEW.arquivo_original_nome := substring(NEW.arquivo_original_nome from 1 for 255);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for upload filename validation
DROP TRIGGER IF EXISTS validate_upload_filename_trigger ON uploads;
CREATE TRIGGER validate_upload_filename_trigger
  BEFORE INSERT OR UPDATE ON uploads
  FOR EACH ROW
  EXECUTE FUNCTION validate_upload_filename();