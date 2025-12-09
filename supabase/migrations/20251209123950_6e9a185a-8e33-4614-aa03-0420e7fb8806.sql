-- Add line thickness setting for stripes/waves background patterns
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS background_line_thickness numeric DEFAULT 2;