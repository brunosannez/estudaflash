
-- Drop the overly restrictive admin-only SELECT policy
DROP POLICY IF EXISTS "Only admins can view credits config" ON public.action_credits_config;

-- Allow all authenticated users to read credits config (it's pricing info, not sensitive)
CREATE POLICY "All authenticated users can view credits config"
ON public.action_credits_config
FOR SELECT
USING (auth.uid() IS NOT NULL);
