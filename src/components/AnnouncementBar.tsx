import { useSettings } from '@/contexts/SettingsContext';
import { Gift, Truck, Sparkles, Tag, Star, Heart, Zap, Percent } from 'lucide-react';
import { Icon } from '@iconify/react';

interface AnnouncementMessage {
  icon: string;
  text: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  truck: Truck,
  gift: Gift,
  sparkles: Sparkles,
  tag: Tag,
  star: Star,
  heart: Heart,
  zap: Zap,
  percent: Percent,
};

// Iconify icons for more variety
const iconifyIcons: Record<string, string> = {
  delivery: 'mdi:truck-delivery',
  sale: 'mdi:sale',
  fire: 'mdi:fire',
  crown: 'mdi:crown',
  diamond: 'mdi:diamond',
  rocket: 'mdi:rocket-launch',
  flash: 'mdi:flash',
  medal: 'mdi:medal',
};

const AnnouncementBar = () => {
  const { settings } = useSettings();
  
  const enabled = (settings as any)?.announcement_enabled !== false;
  const messages: AnnouncementMessage[] = (settings as any)?.announcement_messages || [
    { icon: 'truck', text: 'توصيل مجاني للطلبات فوق 200₪' },
    { icon: 'gift', text: 'اشتري بقيمة 100₪ واحصل على هدية مجانية!' },
    { icon: 'sparkles', text: 'عروض حصرية يومياً - تابعنا!' },
  ];
  const bgColor = (settings as any)?.announcement_bg_color || 'primary';

  if (!enabled) return null;

  const getBgClass = () => {
    switch (bgColor) {
      case 'primary': return 'bg-primary text-primary-foreground';
      case 'secondary': return 'bg-secondary text-secondary-foreground';
      case 'accent': return 'bg-accent text-accent-foreground';
      case 'destructive': return 'bg-destructive text-destructive-foreground';
      case 'muted': return 'bg-muted text-muted-foreground';
      case 'gradient': return 'bg-gradient-to-r from-primary via-purple-500 to-pink-500 text-white';
      case 'gold': return 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  const renderIcon = (iconName: string) => {
    // Check if it's a lucide icon
    const LucideIcon = iconMap[iconName];
    if (LucideIcon) {
      return <LucideIcon className="h-4 w-4 flex-shrink-0" />;
    }
    
    // Check if it's an iconify icon
    const iconifyIcon = iconifyIcons[iconName];
    if (iconifyIcon) {
      return <Icon icon={iconifyIcon} className="h-4 w-4 flex-shrink-0" />;
    }
    
    // Default to sparkles
    return <Sparkles className="h-4 w-4 flex-shrink-0" />;
  };

  return (
    <div className={`${getBgClass()} py-2 overflow-hidden relative`}>
      <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
        {/* Duplicate messages for seamless loop */}
        {[...messages, ...messages, ...messages].map((msg, idx) => (
          <span key={idx} className="inline-flex items-center gap-2 text-sm font-medium mx-4">
            {renderIcon(msg.icon)}
            {msg.text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementBar;