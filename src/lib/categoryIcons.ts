import { icons } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Get all available icon names from lucide-react
export const getAvailableIconNames = (): string[] => {
  return Object.keys(icons).filter(key => 
    typeof icons[key as keyof typeof icons] === 'function' || 
    (typeof icons[key as keyof typeof icons] === 'object' && icons[key as keyof typeof icons] !== null)
  );
};

// Get icon component by name
export const getIconByName = (iconName: string): LucideIcon | null => {
  const IconComponent = icons[iconName as keyof typeof icons];
  if (IconComponent) {
    return IconComponent as LucideIcon;
  }
  return null;
};
