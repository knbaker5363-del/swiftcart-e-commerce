import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

const POPUP_STORAGE_KEY = 'welcome_popup_shown';

const WelcomePopup = () => {
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);

  const popupEnabled = (settings as any)?.welcome_popup_enabled === true;
  const popupImage = (settings as any)?.welcome_popup_image_url;
  const popupLink = (settings as any)?.welcome_popup_link;
  const showOnce = (settings as any)?.welcome_popup_show_once !== false;

  useEffect(() => {
    if (!popupEnabled || !popupImage) return;

    // Check if popup should be shown
    if (showOnce) {
      const hasShown = localStorage.getItem(POPUP_STORAGE_KEY);
      if (hasShown) return;
    }

    // Show popup after a short delay
    const timer = setTimeout(() => {
      setOpen(true);
      if (showOnce) {
        localStorage.setItem(POPUP_STORAGE_KEY, 'true');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [popupEnabled, popupImage, showOnce]);

  if (!popupEnabled || !popupImage) return null;

  const handleClose = () => {
    setOpen(false);
  };

  const ImageContent = () => (
    <img
      src={popupImage}
      alt="عرض خاص"
      className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
    />
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg md:max-w-xl p-0 border-0 bg-transparent shadow-none overflow-hidden">
        <div className="relative">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute -top-2 -left-2 z-50 bg-background text-foreground rounded-full p-2 shadow-lg hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Image with optional link */}
          {popupLink ? (
            <Link to={popupLink} onClick={handleClose}>
              <ImageContent />
            </Link>
          ) : (
            <ImageContent />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomePopup;
