-- Add Telegram bot password column to settings table
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS telegram_bot_password text DEFAULT NULL;