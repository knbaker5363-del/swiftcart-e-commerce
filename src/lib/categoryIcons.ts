import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Category icons list for merchants to choose from
export const categoryIcons: { id: string; name: string; icon: string }[] = [
  // Shopping & Products
  { id: 'shirt', name: 'ملابس', icon: 'Shirt' },
  { id: 'shopping-bag', name: 'حقائب', icon: 'ShoppingBag' },
  { id: 'shopping-cart', name: 'تسوق', icon: 'ShoppingCart' },
  { id: 'gift', name: 'هدايا', icon: 'Gift' },
  { id: 'package', name: 'طرود', icon: 'Package' },
  { id: 'tag', name: 'عروض', icon: 'Tag' },
  
  // Electronics
  { id: 'smartphone', name: 'هواتف', icon: 'Smartphone' },
  { id: 'laptop', name: 'لابتوب', icon: 'Laptop' },
  { id: 'monitor', name: 'شاشات', icon: 'Monitor' },
  { id: 'headphones', name: 'سماعات', icon: 'Headphones' },
  { id: 'camera', name: 'كاميرات', icon: 'Camera' },
  { id: 'gamepad-2', name: 'ألعاب', icon: 'Gamepad2' },
  { id: 'tv', name: 'تلفزيون', icon: 'Tv' },
  { id: 'watch', name: 'ساعات', icon: 'Watch' },
  
  // Home & Kitchen
  { id: 'home', name: 'منزل', icon: 'Home' },
  { id: 'sofa', name: 'أثاث', icon: 'Sofa' },
  { id: 'lamp', name: 'إضاءة', icon: 'Lamp' },
  { id: 'bed', name: 'غرف نوم', icon: 'Bed' },
  { id: 'utensils', name: 'مطبخ', icon: 'Utensils' },
  { id: 'coffee', name: 'مشروبات', icon: 'Coffee' },
  { id: 'refrigerator', name: 'أجهزة منزلية', icon: 'Refrigerator' },
  
  // Beauty & Health
  { id: 'heart', name: 'صحة', icon: 'Heart' },
  { id: 'sparkles', name: 'جمال', icon: 'Sparkles' },
  { id: 'scissors', name: 'تصفيف', icon: 'Scissors' },
  { id: 'spray-can', name: 'عطور', icon: 'SprayCan' },
  
  // Sports & Outdoor
  { id: 'dumbbell', name: 'رياضة', icon: 'Dumbbell' },
  { id: 'bike', name: 'دراجات', icon: 'Bike' },
  { id: 'tent', name: 'تخييم', icon: 'Tent' },
  { id: 'footprints', name: 'أحذية', icon: 'Footprints' },
  
  // Kids & Baby
  { id: 'baby', name: 'أطفال', icon: 'Baby' },
  { id: 'puzzle', name: 'ألعاب أطفال', icon: 'Puzzle' },
  { id: 'cake', name: 'حلويات', icon: 'Cake' },
  
  // Food & Groceries
  { id: 'apple', name: 'فواكه', icon: 'Apple' },
  { id: 'cookie', name: 'معجنات', icon: 'Cookie' },
  { id: 'pizza', name: 'طعام', icon: 'Pizza' },
  { id: 'beef', name: 'لحوم', icon: 'Beef' },
  { id: 'fish', name: 'أسماك', icon: 'Fish' },
  
  // Office & Stationery
  { id: 'book-open', name: 'كتب', icon: 'BookOpen' },
  { id: 'pencil', name: 'قرطاسية', icon: 'Pencil' },
  { id: 'briefcase', name: 'أعمال', icon: 'Briefcase' },
  
  // Automotive
  { id: 'car', name: 'سيارات', icon: 'Car' },
  { id: 'wrench', name: 'أدوات', icon: 'Wrench' },
  
  // General
  { id: 'star', name: 'مميز', icon: 'Star' },
  { id: 'crown', name: 'فاخر', icon: 'Crown' },
  { id: 'zap', name: 'عروض سريعة', icon: 'Zap' },
  { id: 'flame', name: 'الأكثر مبيعاً', icon: 'Flame' },
  { id: 'award', name: 'جوائز', icon: 'Award' },
  { id: 'gem', name: 'مجوهرات', icon: 'Gem' },
  { id: 'glasses', name: 'نظارات', icon: 'Glasses' },
  { id: 'flower2', name: 'زهور', icon: 'Flower2' },
  { id: 'palette', name: 'فن', icon: 'Palette' },
  { id: 'music', name: 'موسيقى', icon: 'Music' },
  { id: 'grid', name: 'عام', icon: 'Grid3X3' },
  { id: 'box', name: 'صندوق', icon: 'Box' },
  { id: 'store', name: 'متجر', icon: 'Store' },
];

// Get icon component by name
export const getIconByName = (iconName: string): LucideIcon | null => {
  const IconComponent = (LucideIcons as any)[iconName];
  if (IconComponent && typeof IconComponent === 'function') {
    return IconComponent as LucideIcon;
  }
  return null;
};

export type CategoryIcon = typeof categoryIcons[number];
