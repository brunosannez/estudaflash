
-- Add custom_name column to resumos table for user-defined summary names
ALTER TABLE public.resumos 
ADD COLUMN custom_name text;

-- Add index for better performance when searching by custom names
CREATE INDEX idx_resumos_custom_name ON public.resumos (custom_name);
