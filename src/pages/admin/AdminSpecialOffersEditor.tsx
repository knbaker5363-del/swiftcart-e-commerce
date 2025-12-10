import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Save, RotateCcw, Eye, Package, Sparkles, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SpecialOffer {
  id: string;
  name: string;
  image_url: string | null;
  background_color: string;
  text_color: string;
  offer_type: string;
  position_x: number | null;
  position_y: number | null;
}

const AdminSpecialOffersEditor = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasChanges, setHasChanges] = useState(false);

  const { data: offers, isLoading } = useQuery({
    queryKey: ['admin-special-offers-editor'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('special_offers')
        .select('id, name, image_url, background_color, text_color, offer_type, position_x, position_y')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as SpecialOffer[];
    }
  });

  // Initialize positions from database
  useEffect(() => {
    if (offers) {
      const initialPositions: Record<string, { x: number; y: number }> = {};
      offers.forEach((offer, index) => {
        initialPositions[offer.id] = {
          x: offer.position_x ?? (50 + (index % 3) * 150),
          y: offer.position_y ?? (50 + Math.floor(index / 3) * 150)
        };
      });
      setPositions(initialPositions);
    }
  }, [offers]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updates = Object.entries(positions).map(([id, pos]) => 
        supabase
          .from('special_offers')
          .update({ position_x: pos.x, position_y: pos.y })
          .eq('id', id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-special-offers-editor'] });
      toast({ title: 'تم حفظ المواقع بنجاح' });
      setHasChanges(false);
    },
    onError: () => {
      toast({ title: 'خطأ في الحفظ', variant: 'destructive' });
    }
  });

  const handleMouseDown = (e: React.MouseEvent, offerId: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setDragging(offerId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newX = e.clientX - containerRect.left - dragOffset.x;
    const newY = e.clientY - containerRect.top - dragOffset.y;
    
    // Keep within bounds
    const boundedX = Math.max(0, Math.min(newX, containerRect.width - 120));
    const boundedY = Math.max(0, Math.min(newY, containerRect.height - 120));
    
    setPositions(prev => ({
      ...prev,
      [dragging]: { x: boundedX, y: boundedY }
    }));
    setHasChanges(true);
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const resetPositions = () => {
    if (offers) {
      const resetPos: Record<string, { x: number; y: number }> = {};
      offers.forEach((offer, index) => {
        resetPos[offer.id] = {
          x: 50 + (index % 3) * 150,
          y: 50 + Math.floor(index / 3) * 150
        };
      });
      setPositions(resetPos);
      setHasChanges(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">تحرير مواقع العروض</h1>
          <p className="text-muted-foreground mt-2">اسحب العروض لتغيير مواقعها على الشاشة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetPositions}>
            <RotateCcw className="h-4 w-4 ml-2" />
            إعادة ضبط
          </Button>
          <Button 
            onClick={() => saveMutation.mutate()} 
            disabled={!hasChanges || saveMutation.isPending}
          >
            <Save className="h-4 w-4 ml-2" />
            {saveMutation.isPending ? 'جاري الحفظ...' : 'حفظ المواقع'}
          </Button>
          <Link to="/special-offers">
            <Button variant="outline">
              <Eye className="h-4 w-4 ml-2" />
              معاينة
            </Button>
          </Link>
        </div>
      </div>

      {/* Editor Canvas */}
      <Card className="overflow-hidden">
        <div 
          ref={containerRef}
          className="relative bg-muted/30 min-h-[600px] cursor-crosshair select-none"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Grid lines for guidance */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="w-full h-full" style={{
              backgroundImage: 'linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }} />
          </div>

          {/* Offers */}
          {offers?.map((offer) => {
            const pos = positions[offer.id] || { x: 50, y: 50 };
            return (
              <div
                key={offer.id}
                className={`absolute cursor-grab active:cursor-grabbing transition-shadow ${dragging === offer.id ? 'z-50 shadow-2xl ring-2 ring-primary' : 'shadow-lg hover:shadow-xl'}`}
                style={{
                  left: pos.x,
                  top: pos.y,
                  width: 120,
                  height: 120,
                }}
                onMouseDown={(e) => handleMouseDown(e, offer.id)}
              >
                <div 
                  className="w-full h-full rounded-full overflow-hidden flex items-center justify-center"
                  style={{ backgroundColor: offer.background_color }}
                >
                  {offer.image_url ? (
                    <img
                      src={offer.image_url}
                      alt={offer.name}
                      className="w-full h-full object-cover pointer-events-none"
                      draggable={false}
                    />
                  ) : (
                    <div className="text-center p-2" style={{ color: offer.text_color }}>
                      {offer.offer_type === 'bundle' ? (
                        <Flame className="h-8 w-8 mx-auto opacity-50" />
                      ) : (
                        <Sparkles className="h-8 w-8 mx-auto opacity-50" />
                      )}
                    </div>
                  )}
                </div>
                <p className="text-center text-xs font-medium mt-1 truncate px-1">{offer.name}</p>
              </div>
            );
          })}

          {/* Empty state */}
          {(!offers || offers.length === 0) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد عروض فعّالة</p>
                <Link to="/admin/special-offers" className="text-primary hover:underline mt-2 inline-block">
                  إضافة عروض جديدة
                </Link>
              </div>
            </div>
          )}
        </div>
      </Card>

      <p className="text-sm text-muted-foreground text-center">
        💡 اسحب الدوائر لتحريكها، ثم اضغط "حفظ المواقع" لتطبيق التغييرات على الموقع
      </p>
    </div>
  );
};

export default AdminSpecialOffersEditor;
