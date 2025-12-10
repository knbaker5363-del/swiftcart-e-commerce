import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Eye, RotateCcw, Save, GripVertical, Flame, Sparkles, Move, Zap, Package } from 'lucide-react';
import { CountdownTimer } from '@/components/ui/countdown-timer';

interface SpecialOffer {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  size: string;
  price: number | null;
  condition_text: string | null;
  offer_type: string;
  required_quantity: number;
  bundle_price: number | null;
  background_color: string;
  text_color: string;
  position_x: number | null;
  position_y: number | null;
  is_active: boolean;
  expires_at: string | null;
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

  // Grid configuration - matches customer view
  const GRID_COLS = 4;
  const CELL_SIZE = 140;
  const GAP = 16;

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
      
      const overlapsX = col < pos.col + pos.width && col + width > pos.col;
      const overlapsY = row < pos.row + pos.height && row + height > pos.row;
      
      if (overlapsX && overlapsY) return false;
    }
    return true;
  };

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const pos = positions.find(p => p.id === id);
    if (!pos) return;
    
    setDraggingId(id);
    setSelectedOfferId(id);
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
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

  // Render offer card exactly like customer sees it
  const renderOfferCard = (offer: SpecialOffer, pos: GridPosition, isEditable: boolean = true) => {
    const isSelected = selectedOfferId === pos.id;
    const isDragging = draggingId === pos.id;

    return (
      <div
        key={pos.id}
        className={`group relative overflow-hidden transition-all duration-300 ${
          pos.isCircle ? 'rounded-full' : 'rounded-2xl'
        } shadow-lg ${isDragging ? 'z-50 scale-105 shadow-2xl cursor-grabbing' : 'cursor-grab'} ${
          isSelected && isEditable ? 'ring-4 ring-primary ring-offset-2 ring-offset-background' : ''
        } ${isEditable ? 'hover:shadow-2xl hover:scale-[1.02]' : ''}`}
        style={{
          position: isEditable ? 'absolute' : 'relative',
          left: isEditable ? `${pos.col * (CELL_SIZE + GAP)}px` : undefined,
          top: isEditable ? `${pos.row * (CELL_SIZE + GAP)}px` : undefined,
          width: isEditable ? `${pos.width * CELL_SIZE + (pos.width - 1) * GAP}px` : undefined,
          height: isEditable ? `${pos.height * CELL_SIZE + (pos.height - 1) * GAP}px` : undefined,
          gridColumn: !isEditable ? `span ${pos.width}` : undefined,
          gridRow: !isEditable ? `span ${pos.height}` : undefined,
          background: offer.image_url ? undefined : `linear-gradient(135deg, ${offer.background_color}, ${offer.background_color}dd)`,
        }}
        onMouseDown={isEditable ? (e) => handleDragStart(e, pos.id) : undefined}
        onClick={isEditable ? () => setSelectedOfferId(pos.id) : undefined}
      >
        {/* Animated Glow Border */}
        <div 
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ 
            boxShadow: `0 0 30px ${offer.background_color}80, 0 0 60px ${offer.background_color}40`,
          }}
        />

        {/* Badge */}
        {offer.offer_type === 'bundle' && offer.required_quantity && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold shadow-lg animate-pulse">
            <Flame className="h-3 w-3" />
            اختر {offer.required_quantity}
          </div>
        )}

        {/* Background Image or Gradient */}
        {offer.image_url ? (
          <img
            src={offer.image_url}
            alt={offer.name}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
              pos.isCircle ? 'rounded-full' : ''
            }`}
          />
        ) : (
          <div 
            className={`w-full h-full flex items-center justify-center ${pos.isCircle ? 'rounded-full' : ''}`}
            style={{ backgroundColor: offer.background_color }}
          >
            <Package className="h-12 w-12 opacity-30 animate-pulse" style={{ color: offer.text_color }} />
          </div>
        )}

        {/* Gradient Overlay - Centered Content */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:via-black/50 transition-all duration-300 flex flex-col items-center justify-end text-center p-3 pb-4 ${
          pos.isCircle ? 'rounded-full' : ''
        }`}>
          <h3 className="font-bold text-sm md:text-base mb-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] text-white leading-tight line-clamp-2">
            {offer.name}
          </h3>
          
          {offer.condition_text && !pos.isCircle && (
            <p className="text-xs text-white/90 mb-2 line-clamp-1 drop-shadow-lg">{offer.condition_text}</p>
          )}
          
          {/* Countdown Timer */}
          {offer.expires_at && !pos.isCircle && (
            <div className="mb-2 scale-75">
              <CountdownTimer expiresAt={offer.expires_at} size="sm" showLabels={false} />
            </div>
          )}
          
          {/* Price Display */}
          {offer.bundle_price ? (
            <div className="inline-flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 px-2 py-1 rounded-full text-white font-bold shadow-xl text-xs group-hover:animate-pulse">
              <Zap className="h-3 w-3" />
              {offer.required_quantity} بـ {offer.bundle_price}₪
            </div>
          ) : offer.price ? (
            <div className="inline-block bg-primary px-2 py-1 rounded-full font-bold shadow-xl text-xs text-white group-hover:animate-pulse">
              {offer.price}₪
            </div>
          ) : null}
        </div>

        {/* Drag indicator for editable mode */}
        {isEditable && (
          <div className="absolute top-2 left-2 opacity-50 group-hover:opacity-100 bg-black/50 rounded-full p-1 transition-opacity">
            <Move className="h-3 w-3 text-white" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-8 border-t pt-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold">محرر ترتيب العروض</h2>
          <p className="text-muted-foreground text-sm">اسحب العروض لترتيبها كما ستظهر للزبون</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={previewMode ? "default" : "outline"}
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

      {!previewMode ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Grid Canvas */}
          <Card className="p-6 overflow-auto bg-muted/20">
            <div
              id="offers-grid-canvas"
              className="relative mx-auto"
              style={{
                backgroundImage: `
                  linear-gradient(to right, hsl(var(--border) / 0.3) 1px, transparent 1px),
                  linear-gradient(to bottom, hsl(var(--border) / 0.3) 1px, transparent 1px)
                `,
                backgroundSize: `${CELL_SIZE + GAP}px ${CELL_SIZE + GAP}px`,
                minHeight: `${maxRow * (CELL_SIZE + GAP)}px`,
                width: `${GRID_COLS * (CELL_SIZE + GAP)}px`,
              }}
              onMouseMove={handleDrag}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
            >
              {/* Offer cards */}
              {positions.map(pos => {
                const offer = offers.find(o => o.id === pos.id);
                if (!offer) return null;
                return renderOfferCard(offer, pos, true);
              })}
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              💡 اسحب البطاقات لتغيير مواقعها • الشبكة 4 أعمدة كما يراها الزبون
            </p>
          </Card>

          {/* Settings Panel */}
          <Card className="p-4 h-fit sticky top-4">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <GripVertical className="h-4 w-4" />
              إعدادات البطاقة
            </h3>

            {selectedOffer && selectedPosition ? (
              <div className="space-y-4">
                {/* Offer mini preview */}
                <div 
                  className={`w-full aspect-square relative overflow-hidden ${
                    selectedPosition.isCircle ? 'rounded-full' : 'rounded-xl'
                  }`}
                  style={{ 
                    background: selectedOffer.image_url ? undefined : `linear-gradient(135deg, ${selectedOffer.background_color}, ${selectedOffer.background_color}dd)`,
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
                    <div className={`w-full h-full flex items-center justify-center ${
                      selectedPosition.isCircle ? 'rounded-full' : ''
                    }`}>
                      {selectedOffer.offer_type === 'bundle' ? (
                        <Flame className="h-12 w-12 opacity-30" style={{ color: selectedOffer.text_color }} />
                      ) : (
                        <Sparkles className="h-12 w-12 opacity-30" style={{ color: selectedOffer.text_color }} />
                      )}
                    </div>
                  )}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-3 ${
                    selectedPosition.isCircle ? 'rounded-full' : ''
                  }`}>
                    <p className="text-white font-bold text-sm text-center px-2">{selectedOffer.name}</p>
                  </div>
                </div>

                {/* Size selection */}
                <div>
                  <Label className="text-xs mb-2 block">نوع البطاقة</Label>
                  <Select 
                    value={selectedPosition.isCircle ? 'circle' : 
                           selectedPosition.width === 2 && selectedPosition.height === 2 ? '4x4' :
                           selectedPosition.width === 2 ? '2x4' : '2x2'}
                    onValueChange={updateOfferSize}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2x2">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-primary/20 rounded" />
                          مربع صغير (1×1)
                        </div>
                      </SelectItem>
                      <SelectItem value="2x4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-4 bg-primary/20 rounded" />
                          مستطيل عرضي (2×1)
                        </div>
                      </SelectItem>
                      <SelectItem value="4x4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary/20 rounded" />
                          مربع كبير (2×2)
                        </div>
                      </SelectItem>
                      <SelectItem value="circle">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-primary/20 rounded-full" />
                          دائرة
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Position info */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">العمود</p>
                    <p className="font-bold text-lg">{selectedPosition.col + 1}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">الصف</p>
                    <p className="font-bold text-lg">{selectedPosition.row + 1}</p>
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

                <p className="text-xs text-muted-foreground text-center">
                  💡 اسحب البطاقة في الشبكة لتغيير موقعها
                </p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <GripVertical className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">اضغط على بطاقة لتعديلها</p>
              </div>
            )}
          </Card>
        </div>
      ) : (
        /* Preview Mode - Exactly like customer view */
        <Card className="p-6 bg-background">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
              <Eye className="h-4 w-4" />
              هذا ما سيراه الزبون
            </div>
          </div>
          
          <div 
            className="grid gap-4 mx-auto"
            style={{
              gridTemplateColumns: 'repeat(4, 1fr)',
              gridAutoRows: '140px',
              maxWidth: `${GRID_COLS * (CELL_SIZE + GAP)}px`,
            }}
          >
            {positions
              .sort((a, b) => a.row - b.row || a.col - b.col)
              .map(pos => {
                const offer = offers.find(o => o.id === pos.id);
                if (!offer) return null;
                return renderOfferCard(offer, pos, false);
              })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default OffersGridEditor;
