-- Add icon column to categories table for storing selected icon name
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS icon_name TEXT DEFAULT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN public.categories.icon_name IS 'Lucide icon name for category display when using icon mode or as fallback when no image is set';