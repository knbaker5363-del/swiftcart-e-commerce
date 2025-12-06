import { ShoppingCart, Heart, Search, Star } from 'lucide-react';
interface ThemePreviewProps {
  themeId: string;
}
const ThemePreview = ({
  themeId
}: ThemePreviewProps) => {
  return <div className="rounded-lg overflow-hidden border-2 border-border shadow-lg" data-theme={themeId} style={{
    minHeight: '280px'
  }}>
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
      

      {/* Footer Preview */}
      
    </div>;
};
export default ThemePreview;