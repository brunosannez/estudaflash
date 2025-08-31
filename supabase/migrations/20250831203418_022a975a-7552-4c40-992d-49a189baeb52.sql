-- Add type field to flashcards table
ALTER TABLE public.flashcards ADD COLUMN IF NOT EXISTS card_type TEXT;

-- Create index for better performance on card type queries
CREATE INDEX IF NOT EXISTS idx_flashcards_card_type ON public.flashcards(card_type);

-- Update existing flashcards to have a default type
UPDATE public.flashcards 
SET card_type = 'definicao' 
WHERE card_type IS NULL;