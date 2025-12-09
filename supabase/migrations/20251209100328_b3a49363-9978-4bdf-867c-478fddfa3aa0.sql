-- Add show_header_store_name setting for separate control
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS show_header_store_name boolean DEFAULT true;