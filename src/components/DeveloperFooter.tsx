import { useSettings } from '@/contexts/SettingsContext';

const DeveloperFooter = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-card border-t mt-8">
      {/* حقوق المتجر */}
      <div className="container py-6">
        <p className="text-center text-sm text-muted-foreground">
          جميع الحقوق محفوظة لـ {settings?.store_name || 'متجري'} © {new Date().getFullYear()}
        </p>
      </div>
      
      {/* تم التطوير بواسطة PALPROX */}
      <div className="border-t bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="container py-4">
          <div className="flex justify-center">
            <a
              href="https://palprox.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-primary/20 border border-primary/20 hover:border-primary/40 transition-all duration-500 hover:shadow-lg hover:shadow-primary/20 hover:scale-105"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
              
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors relative z-10">
                تم التطوير بواسطة
              </span>
              
              {/* PALPROX Logo/Text with special styling */}
              <span className="relative z-10 font-black text-lg tracking-wider bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent group-hover:from-primary group-hover:via-primary/90 group-hover:to-primary transition-all duration-500">
                PALPROX
              </span>
              
              {/* Sparkle decoration */}
              <svg 
                className="w-4 h-4 text-primary opacity-60 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-12" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DeveloperFooter;
