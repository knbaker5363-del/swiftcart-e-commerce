import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Eye, RotateCcw, Save, GripVertical, Flame, Sparkles, Move } from 'lucide-react';

interface SpecialOffer {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  size: string;
  price: number | null;
  offer_type: string;
  required_quantity: number;
  bundle_price: number | null;
  background_color: string;
  text_color: string;
  position_x: number | null;
  position_y: number | null;
  is_active: boolean;
}

interface GridPosition {
  id: string;
  col: number;
  row: number;
  width: number;
  height: number;
  isCircle: boolean;
}

interface OffersGridEditorProps {
  offers: SpecialOffer[];
  onRefresh: () => void;
}

const OffersGridEditor = ({ offers, onRefresh }: OffersGridEditorProps) => {
  const { toast } = useToast();
  const [positions, setPositions] = useState<GridPosition[]>([]);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Grid configuration
  const GRID_COLS = 4;
  const CELL_SIZE = 100; // Base cell size in pixels
  const GAP = 12;

  // Convert size to width/height
  const getSizeFromType = (size: string): { width: number; height: number; isCircle: boolean } => {
    switch (size) {
      case '2x4':
        return { width: 2, height: 1, isCircle: false };
      case '4x4':
        return { width: 2, height: 2, isCircle: false };
      case 'circle':
        return { width: 1, height: 1, isCircle: true };
      case '2x2':
      default:
        return { width: 1, height: 1, isCircle: false };
    }
  };

  // Initialize positions from offers
  useEffect(() => {
    const initialPositions: GridPosition[] = offers.map((offer, index) => {
      const { width, height, isCircle } = getSizeFromType(offer.size);
      return {
        id: offer.id,
        col: offer.position_x ?? (index % GRID_COLS),
        row: offer.position_y ?? Math.floor(index / GRID_COLS),
        width,
        height,
        isCircle,
      };
    });
    setPositions(initialPositions);
  }, [offers]);

  const selectedOffer = offers.find(o => o.id === selectedOfferId);
  const selectedPosition = positions.find(p => p.id === selectedOfferId);

  // Check if position is valid (no overlap)
  const isPositionValid = (id: string, col: number, row: number, width: number, height: number): boolean => {
    if (col < 0 || row < 0 || col + width > GRID_COLS) return false;
    
    for (const pos of positions) {
      if (pos.id === id) continue;
      
      // Check for overlap
      const overlapsX = col < pos.col + pos.width && col + width > pos.col;
      const overlapsY = row < pos.row + pos.height && row + height > pos.row;
      
      if (overlapsX && overlapsY) return false;
    }
    return true;
  };

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent, id: string) => {
    const pos = positions.find(p => p.id === id);
    if (!pos) return;
    
    setDraggingId(id);
    setSelectedOfferId(id);
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Handle drag
  const handleDrag = useCallback((e: React.MouseEvent) => {
    if (!draggingId) return;
    
    const gridElement = document.getElementById('offers-grid-canvas');
    if (!gridElement) return;
    
    const gridRect = gridElement.getBoundingClientRect();
    const x = e.clientX - gridRect.left - dragOffset.x;
    const y = e.clientY - gridRect.top - dragOffset.y;
    
    const col = Math.round(x / (CELL_SIZE + GAP));
    const row = Math.round(y / (CELL_SIZE + GAP));
    
    const pos = positions.find(p => p.id === draggingId);
    if (!pos) return;
    
    if (isPositionValid(draggingId, col, row, pos.width, pos.height)) {
      setPositions(prev => prev.map(p => 
        p.id === draggingId ? { ...p, col: Math.max(0, col), row: Math.max(0, row) } : p
      ));
    }
  }, [draggingId, dragOffset, positions]);

  // Handle drag end
  const handleDragEnd = () => {
    setDraggingId(null);
  };

  // Update offer size
  const updateOfferSize = (size: string) => {
    if (!selectedOfferId) return;
    
    const { width, height, isCircle } = getSizeFromType(size);
    const currentPos = positions.find(p => p.id === selectedOfferId);
    
    if (currentPos && isPositionValid(selectedOfferId, currentPos.col, currentPos.row, width, height)) {
      setPositions(prev => prev.map(p => 
        p.id === selectedOfferId ? { ...p, width, height, isCircle } : p
      ));
    } else {
      toast({ title: 'لا يمكن تغيير الحجم - يوجد تداخل', variant: 'destructive' });
    }
  };

  // Reset positions
  const resetPositions = () => {
    const resetPositions: GridPosition[] = offers.map((offer, index) => {
      const { width, height, isCircle } = getSizeFromType(offer.size);
      return {
        id: offer.id,
        col: index % GRID_COLS,
        row: Math.floor(index / GRID_COLS),
        width,
        height,
        isCircle,
      };
    });
    setPositions(resetPositions);
    toast({ title: 'تم إعادة ضبط المواقع' });
  };

  // Save positions to database
  const savePositions = async () => {
    setSaving(true);
    try {
      for (const pos of positions) {
        const sizeType = pos.isCircle ? 'circle' : 
                        pos.width === 2 && pos.height === 2 ? '4x4' :
                        pos.width === 2 && pos.height === 1 ? '2x4' : '2x2';
        
        await supabase
          .from('special_offers')
          .update({
            position_x: pos.col,
            position_y: pos.row,
            size: sizeType,
          })
          .eq('id', pos.id);
      }
      
      toast({ title: 'تم حفظ المواقع بنجاح' });
      onRefresh();
    } catch (error) {
      toast({ title: 'حدث خطأ في الحفظ', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Calculate max row for grid height
  const maxRow = Math.max(...positions.map(p => p.row + p.height), 2);

  return (
    <div className="mt-8 border-t pt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">محرر ترتيب العروض</h2>
          <p className="text-muted-foreground text-sm">اسحب العروض لترتيبها كما ستظهر للزبون</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            {previewMode ? 'إغلاق المعاينة' : 'معاينة الزبون'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetPositions}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            إعادة ضبط
          </Button>
          <Button
            size="sm"
            onClick={savePositions}
            disabled={saving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'جاري الحفظ...' : 'حفظ المواقع'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Grid Canvas */}
        <Card className="p-4 overflow-auto">
          <div
            id="offers-grid-canvas"
            className="relative bg-muted/30 rounded-xl p-4"
            style={{
              backgroundImage: 'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
              backgroundSize: `${CELL_SIZE + GAP}px ${CELL_SIZE + GAP}px`,
              minHeight: `${maxRow * (CELL_SIZE + GAP) + GAP}px`,
              width: `${GRID_COLS * (CELL_SIZE + GAP) + GAP}px`,
            }}
            onMouseMove={handleDrag}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
          >
            {/* Grid cells overlay */}
            {Array.from({ length: GRID_COLS * maxRow }).map((_, i) => (
              <div
                key={i}
                className="absolute border border-dashed border-border/30 rounded-lg pointer-events-none"
                style={{
                  left: `${(i % GRID_COLS) * (CELL_SIZE + GAP) + GAP / 2}px`,
                  top: `${Math.floor(i / GRID_COLS) * (CELL_SIZE + GAP) + GAP / 2}px`,
                  width: `${CELL_SIZE}px`,
                  height: `${CELL_SIZE}px`,
                }}
              />
            ))}

            {/* Offer cards */}
            {positions.map(pos => {
              const offer = offers.find(o => o.id === pos.id);
              if (!offer) return null;

              const isSelected = selectedOfferId === pos.id;
              const isDragging = draggingId === pos.id;

              return (
                <div
                  key={pos.id}
                  className={`absolute cursor-move transition-all duration-150 ${
                    isDragging ? 'z-50 scale-105 shadow-2xl' : 'z-10'
                  } ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''} ${
                    pos.isCircle ? 'rounded-full' : 'rounded-xl'
                  }`}
                  style={{
                    left: `${pos.col * (CELL_SIZE + GAP) + GAP / 2}px`,
                    top: `${pos.row * (CELL_SIZE + GAP) + GAP / 2}px`,
                    width: `${pos.width * CELL_SIZE + (pos.width - 1) * GAP}px`,
                    height: `${pos.height * CELL_SIZE + (pos.height - 1) * GAP}px`,
                    backgroundColor: offer.background_color,
                    color: offer.text_color,
                  }}
                  onMouseDown={(e) => handleDragStart(e, pos.id)}
                  onClick={() => setSelectedOfferId(pos.id)}
                >
                  {/* Card content */}
                  <div className={`relative w-full h-full flex flex-col items-center justify-center p-2 overflow-hidden ${
                    pos.isCircle ? 'rounded-full' : 'rounded-xl'
                  }`}>
                    {offer.image_url ? (
                      <img
                        src={offer.image_url}
                        alt={offer.name}
                        className={`absolute inset-0 w-full h-full object-cover ${
                          pos.isCircle ? 'rounded-full' : 'rounded-xl'
                        }`}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        {offer.offer_type === 'bundle' ? (
                          <Flame className="h-12 w-12" />
                        ) : (
                          <Sparkles className="h-12 w-12" />
                        )}
                      </div>
                    )}
                    
                    {/* Content overlay */}
                    <div className="relative z-10 text-center">
                      <p className="font-bold text-xs truncate max-w-full px-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                        {offer.name}
                      </p>
                      {offer.offer_type === 'bundle' && offer.bundle_price && (
                        <p className="text-xs opacity-80">
                          {offer.required_quantity} بـ {offer.bundle_price}₪
                        </p>
                      )}
                    </div>

                    {/* Drag handle indicator */}
                    <div className="absolute top-1 right-1 opacity-50 hover:opacity-100">
                      <Move className="h-3 w-3" />
                    </div>

                    {/* Size indicator */}
                    <div className="absolute bottom-1 left-1 text-[10px] opacity-50 bg-black/30 px-1 rounded">
                      {pos.width}x{pos.height}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground text-center mt-3">
            اسحب البطاقات لتغيير مواقعها • الشبكة 4 أعمدة
          </p>
        </Card>

        {/* Settings Panel */}
        <Card className="p-4 h-fit">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <GripVertical className="h-4 w-4" />
            إعدادات البطاقة
          </h3>

          {selectedOffer && selectedPosition ? (
            <div className="space-y-4">
              {/* Offer preview */}
              <div 
                className={`w-full aspect-square flex items-center justify-center ${
                  selectedPosition.isCircle ? 'rounded-full' : 'rounded-xl'
                }`}
                style={{ 
                  backgroundColor: selectedOffer.background_color,
                  color: selectedOffer.text_color,
                }}
              >
                {selectedOffer.image_url ? (
                  <img 
                    src={selectedOffer.image_url} 
                    alt={selectedOffer.name}
                    className={`w-full h-full object-cover ${
                      selectedPosition.isCircle ? 'rounded-full' : 'rounded-xl'
                    }`}
                  />
                ) : (
                  <div className="text-center p-4">
                    {selectedOffer.offer_type === 'bundle' ? (
                      <Flame className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    ) : (
                      <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    )}
                    <p className="font-bold text-sm">{selectedOffer.name}</p>
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <Label className="text-xs">اسم العرض</Label>
                <Input value={selectedOffer.name} disabled className="mt-1" />
              </div>

              {/* Size selection */}
              <div>
                <Label className="text-xs">نوع البطاقة</Label>
                <Select 
                  value={selectedPosition.isCircle ? 'circle' : 
                         selectedPosition.width === 2 && selectedPosition.height === 2 ? '4x4' :
                         selectedPosition.width === 2 ? '2x4' : '2x2'}
                  onValueChange={updateOfferSize}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2x2">مربع صغير (1×1)</SelectItem>
                    <SelectItem value="2x4">مستطيل عرضي (2×1)</SelectItem>
                    <SelectItem value="4x4">مربع كبير (2×2)</SelectItem>
                    <SelectItem value="circle">دائرة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Position info */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">العمود</Label>
                  <Input 
                    type="number" 
                    value={selectedPosition.col + 1} 
                    disabled 
                    className="mt-1" 
                  />
                </div>
                <div>
                  <Label className="text-xs">الصف</Label>
                  <Input 
                    type="number" 
                    value={selectedPosition.row + 1} 
                    disabled 
                    className="mt-1" 
                  />
                </div>
              </div>

              {/* Circle toggle */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <Label className="text-sm">شكل دائري</Label>
                <Switch 
                  checked={selectedPosition.isCircle}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateOfferSize('circle');
                    } else {
                      updateOfferSize('2x2');
                    }
                  }}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                💡 اسحب البطاقة في الشبكة لتغيير موقعها
              </p>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <GripVertical className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">اضغط على بطاقة لتعديلها</p>
            </div>
          )}
        </Card>
      </div>

      {/* Preview Mode Modal */}
      {previewMode && (
        <div className="fixed inset-0 bg-background/95 z-50 overflow-auto">
          <div className="container py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">معاينة صفحة العروض</h2>
              <Button onClick={() => setPreviewMode(false)}>
                إغلاق المعاينة
              </Button>
            </div>
            
            {/* Customer view grid */}
            <div 
              className="grid gap-4"
              style={{
                gridTemplateColumns: 'repeat(4, 1fr)',
                gridAutoRows: '120px',
              }}
            >
              {positions
                .sort((a, b) => a.row - b.row || a.col - b.col)
                .map(pos => {
                  const offer = offers.find(o => o.id === pos.id);
                  if (!offer) return null;

                  return (
                    <div
                      key={pos.id}
                      className={`relative overflow-hidden ${
                        pos.isCircle ? 'rounded-full' : 'rounded-2xl'
                      }`}
                      style={{
                        gridColumn: `span ${pos.width}`,
                        gridRow: `span ${pos.height}`,
                        backgroundColor: offer.background_color,
                        color: offer.text_color,
                      }}
                    >
                      {offer.image_url ? (
                        <img
                          src={offer.image_url}
                          alt={offer.name}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="font-bold text-lg">{offer.name}</h3>
                        {offer.offer_type === 'bundle' && offer.bundle_price && (
                          <p className="text-sm opacity-90">
                            اختر {offer.required_quantity} بـ {offer.bundle_price}₪
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OffersGridEditor;
