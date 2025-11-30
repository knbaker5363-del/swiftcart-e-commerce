-- Add WhatsApp settings to settings table
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS whatsapp_country_code text DEFAULT '972',
ADD COLUMN IF NOT EXISTS whatsapp_number text;