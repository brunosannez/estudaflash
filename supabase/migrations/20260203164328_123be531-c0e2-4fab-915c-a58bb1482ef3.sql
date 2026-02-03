-- Add custom_name column to enem_quiz_metadata for quiz renaming
ALTER TABLE enem_quiz_metadata 
ADD COLUMN IF NOT EXISTS custom_name text DEFAULT NULL;

-- Add comment to document the column
COMMENT ON COLUMN enem_quiz_metadata.custom_name IS 'User-defined custom name for the quiz. If NULL, uses auto-generated name from tema + date.';