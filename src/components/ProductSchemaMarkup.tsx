import { useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

interface ProductSchemaProps {
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
    discount_percentage?: number;
    image_url?: string;
    categories?: { name: string };
    brand?: { name: string };
    track_stock?: boolean;
    stock_quantity?: number;
  };
}

export const ProductSchemaMarkup = ({ product }: ProductSchemaProps) => {
  const { settings } = useSettings();

  useEffect(() => {
    if (!product || !settings) return;

    const hasDiscount = (product.discount_percentage ?? 0) > 0;
    const currentPrice = hasDiscount 
      ? product.price * (1 - (product.discount_percentage ?? 0) / 100)
      : product.price;

    // Determine availability
    let availability = 'https://schema.org/InStock';
    if (product.track_stock && product.stock_quantity !== undefined) {
      if (product.stock_quantity <= 0) {
        availability = 'https://schema.org/OutOfStock';
      } else if (product.stock_quantity < 5) {
        availability = 'https://schema.org/LimitedAvailability';
      }
    }

    const schema = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: product.name,
      description: product.description || product.name,
      image: product.image_url || '',
      sku: product.id.substring(0, 8),
      brand: product.brand?.name ? {
        '@type': 'Brand',
        name: product.brand.name
      } : undefined,
      category: product.categories?.name,
      offers: {
        '@type': 'Offer',
        url: window.location.href,
        priceCurrency: 'ILS',
        price: currentPrice.toFixed(2),
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        availability: availability,
        seller: {
          '@type': 'Organization',
          name: settings.store_name
        }
      }
    };

    // Remove existing schema
    const existingSchema = document.querySelector('script[data-product-schema]');
    if (existingSchema) {
      existingSchema.remove();
    }

    // Add new schema
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-product-schema', 'true');
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [product, settings]);

  return null;
};

export default ProductSchemaMarkup;
