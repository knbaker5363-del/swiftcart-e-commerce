import { Facebook, Link, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SiTiktok } from 'react-icons/si';

interface ProductShareButtonsProps {
  productName: string;
  productUrl?: string;
  productImage?: string;
}

export const ProductShareButtons = ({ productName, productUrl, productImage }: ProductShareButtonsProps) => {
  const { toast } = useToast();
  const url = productUrl || window.location.href;
  const text = `تحقق من هذا المنتج: ${productName}`;

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'تم نسخ الرابط',
        description: 'يمكنك مشاركته الآن',
      });
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل نسخ الرابط',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground">مشاركة:</span>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 bg-green-500 hover:bg-green-600 text-white border-0"
        onClick={handleWhatsAppShare}
        title="مشاركة عبر واتساب"
      >
        <MessageCircle className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white border-0"
        onClick={handleFacebookShare}
        title="مشاركة عبر فيسبوك"
      >
        <Facebook className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 bg-black hover:bg-gray-800 text-white border-0"
        onClick={handleTwitterShare}
        title="مشاركة عبر تويتر"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={handleCopyLink}
        title="نسخ الرابط"
      >
        <Link className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ProductShareButtons;
