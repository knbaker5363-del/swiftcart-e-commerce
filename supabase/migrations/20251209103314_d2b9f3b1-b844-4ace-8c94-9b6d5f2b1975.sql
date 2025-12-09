-- Add back button text and loading logo visibility settings
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS back_button_text TEXT DEFAULT 'رجوع',
ADD COLUMN IF NOT EXISTS loading_show_logo BOOLEAN DEFAULT true;