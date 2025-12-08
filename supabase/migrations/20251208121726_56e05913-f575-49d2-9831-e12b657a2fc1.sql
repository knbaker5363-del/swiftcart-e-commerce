-- Add visual effects settings column
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS visual_effects JSONB DEFAULT '{
  "scroll_reveal": true,
  "product_hover_lift": true,
  "product_hover_glow": true,
  "product_3d_tilt": false,
  "button_shine": true,
  "button_ripple": true,
  "button_glow": true,
  "button_scale": true,
  "text_typewriter": false,
  "text_gradient": false,
  "text_wave": false,
  "text_fade": true,
  "card_border_glow": false,
  "card_glass_effect": false,
  "image_zoom_hover": true,
  "image_parallax": false,
  "navbar_blur": true,
  "navbar_shadow": true,
  "loading_skeleton": true,
  "loading_shimmer": true,
  "badge_pulse": true,
  "heart_beat": true,
  "floating_elements": false,
  "stagger_animation": true,
  "smooth_scroll": true
}'::jsonb;