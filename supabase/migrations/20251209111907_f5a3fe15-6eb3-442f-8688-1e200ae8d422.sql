-- Add background icon density and size mode settings
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS background_icon_density integer DEFAULT 30,
ADD COLUMN IF NOT EXISTS background_icon_size_mode text DEFAULT 'random';

COMMENT ON COLUMN public.settings.background_icon_density IS 'Number of icons in background (10-50)';
COMMENT ON COLUMN public.settings.background_icon_size_mode IS 'Icon size mode: random or uniform';