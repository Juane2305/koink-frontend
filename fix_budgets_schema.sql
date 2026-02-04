-- Add currency column to budgets table
ALTER TABLE public.budgets 
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'ARS';

-- Update existing records to have a default currency if they are null
UPDATE public.budgets 
SET currency = 'ARS' 
WHERE currency IS NULL;

-- Notify PostgREST to reload the schema cache
-- This is critical for the API to recognize the new column
NOTIFY pgrst, 'reload schema';
