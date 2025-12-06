-- Add background color and sort order columns to categories
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS bg_color TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Update existing categories with sort order based on creation date
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rn
  FROM public.categories
)
UPDATE public.categories c
SET sort_order = n.rn
FROM numbered n
WHERE c.id = n.id;