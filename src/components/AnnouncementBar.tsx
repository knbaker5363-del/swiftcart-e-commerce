import { useSettings } from '@/contexts/SettingsContext';
import { Gift, Truck, Sparkles } from 'lucide-react';

const AnnouncementBar = () => {
  const { settings } = useSettings();
  
  // Default messages that scroll
  const messages = [
    { icon: Truck, text: 'توصيل مجاني للطلبات فوق 200₪' },
    { icon: Gift, text: 'اشتري بقيمة 100₪ واحصل على هدية مجانية!' },
    { icon: Sparkles, text: 'عروض حصرية يومياً - تابعنا!' },
  ];

  return (
    <div className="bg-primary text-primary-foreground py-2 overflow-hidden relative">
      <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
        {/* Duplicate messages for seamless loop */}
        {[...messages, ...messages, ...messages].map((msg, idx) => (
          <span key={idx} className="inline-flex items-center gap-2 text-sm font-medium mx-4">
            <msg.icon className="h-4 w-4" />
            {msg.text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementBar;