-- Add store_phone field to settings table for the merchant's contact number
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS store_phone text DEFAULT NULL;