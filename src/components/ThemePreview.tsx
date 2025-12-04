import { ShoppingCart, Heart, Search, Star } from 'lucide-react';

interface ThemePreviewProps {
  themeId: string;
}

const ThemePreview = ({ themeId }: ThemePreviewProps) => {
  return (
    <div 
      className="rounded-lg overflow-hidden border-2 border-border shadow-lg"
      data-theme={themeId}
      style={{ minHeight: '280px' }}
    >
      {/* Header Preview */}
      <div className="bg-background p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-xs font-bold">م</span>
            </div>
            <span className="font-bold text-foreground text-sm">متجري</span>
          </div>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Heart className="w-4 h-4 text-muted-foreground" />
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Hero Preview */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
        <div className="text-center">
          <h3 className="text-primary font-bold text-lg mb-1">عروض خاصة</h3>
          <p className="text-muted-foreground text-xs">خصومات تصل إلى 50%</p>
        </div>
      </div>

      {/* Products Preview */}
      <div className="bg-background p-3">
        <div className="grid grid-cols-2 gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="bg-card rounded-lg p-2 border border-border">
              <div className="aspect-square bg-muted rounded mb-2 flex items-center justify-center">
                <span className="text-muted-foreground text-xs">صورة</span>
              </div>
              <h4 className="text-foreground text-xs font-medium truncate">منتج {i}</h4>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-2 h-2 fill-primary text-primary" />
                ))}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-primary font-bold text-xs">₪99</span>
                <button className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded">
                  أضف
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Preview */}
      <div className="bg-secondary/20 p-2 text-center">
        <span className="text-muted-foreground text-[10px]">© 2024 متجري</span>
      </div>
    </div>
  );
};

export default ThemePreview;
