-- Add Telegram configuration columns to settings table
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS telegram_bot_token text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS telegram_chat_id text DEFAULT NULL;