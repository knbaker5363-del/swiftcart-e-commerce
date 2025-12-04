-- Add accent color field for buttons/interactive elements
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT 'primary';

-- Add text color field for general text
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS text_style TEXT DEFAULT 'default';