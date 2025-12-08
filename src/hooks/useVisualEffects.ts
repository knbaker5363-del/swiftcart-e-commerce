import { useSettings } from '@/contexts/SettingsContext';

interface VisualEffects {
  scroll_reveal: boolean;
  product_hover_lift: boolean;
  product_hover_glow: boolean;
  product_3d_tilt: boolean;
  button_shine: boolean;
  button_ripple: boolean;
  button_glow: boolean;
  button_scale: boolean;
  text_typewriter: boolean;
  text_gradient: boolean;
  text_wave: boolean;
  text_fade: boolean;
  card_border_glow: boolean;
  card_glass_effect: boolean;
  image_zoom_hover: boolean;
  image_parallax: boolean;
  navbar_blur: boolean;
  navbar_shadow: boolean;
  loading_skeleton: boolean;
  loading_shimmer: boolean;
  badge_pulse: boolean;
  heart_beat: boolean;
  floating_elements: boolean;
  stagger_animation: boolean;
  smooth_scroll: boolean;
}

const defaultEffects: VisualEffects = {
  scroll_reveal: true,
  product_hover_lift: true,
  product_hover_glow: true,
  product_3d_tilt: false,
  button_shine: true,
  button_ripple: true,
  button_glow: true,
  button_scale: true,
  text_typewriter: false,
  text_gradient: false,
  text_wave: false,
  text_fade: true,
  card_border_glow: false,
  card_glass_effect: false,
  image_zoom_hover: true,
  image_parallax: false,
  navbar_blur: true,
  navbar_shadow: true,
  loading_skeleton: true,
  loading_shimmer: true,
  badge_pulse: true,
  heart_beat: true,
  floating_elements: false,
  stagger_animation: true,
  smooth_scroll: true,
};

export const useVisualEffects = () => {
  const { settings } = useSettings();
  const effects: VisualEffects = {
    ...defaultEffects,
    ...((settings as any)?.visual_effects || {}),
  };

  // Helper functions to get CSS classes based on enabled effects
  const getProductCardClasses = () => {
    const classes: string[] = [];
    if (effects.product_hover_lift) classes.push('hover-lift');
    if (effects.product_hover_glow) classes.push('product-card-pro');
    if (effects.card_border_glow) classes.push('animated-border-glow');
    if (effects.card_glass_effect) classes.push('glass');
    return classes.join(' ');
  };

  const getButtonClasses = () => {
    const classes: string[] = [];
    if (effects.button_shine) classes.push('shine-effect');
    if (effects.button_scale) classes.push('hover:scale-[1.02] active:scale-[0.98]');
    if (effects.button_glow) classes.push('hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)]');
    return classes.join(' ');
  };

  const getTextClasses = (type: 'title' | 'subtitle' | 'body') => {
    const classes: string[] = [];
    if (effects.text_gradient && type === 'title') {
      classes.push('bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent');
    }
    return classes.join(' ');
  };

  const getImageClasses = () => {
    const classes: string[] = [];
    if (effects.image_zoom_hover) classes.push('hover:scale-105 transition-transform duration-300');
    return classes.join(' ');
  };

  const getNavbarClasses = () => {
    const classes: string[] = [];
    if (effects.navbar_blur) classes.push('backdrop-blur-md bg-background/80');
    if (effects.navbar_shadow) classes.push('shadow-md');
    return classes.join(' ');
  };

  const getBadgeClasses = () => {
    const classes: string[] = [];
    if (effects.badge_pulse) classes.push('animate-pulse');
    return classes.join(' ');
  };

  const getHeartClasses = () => {
    const classes: string[] = [];
    if (effects.heart_beat) classes.push('animate-heartbeat');
    return classes.join(' ');
  };

  return {
    effects,
    getProductCardClasses,
    getButtonClasses,
    getTextClasses,
    getImageClasses,
    getNavbarClasses,
    getBadgeClasses,
    getHeartClasses,
    // Individual effect checks
    isEnabled: (effect: keyof VisualEffects) => effects[effect],
  };
};
