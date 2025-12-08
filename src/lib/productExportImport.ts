import { supabase } from '@/integrations/supabase/client';

export interface ExportProduct {
  name: string;
  description: string;
  price: number;
  category_name: string;
  brand_name: string;
  image_url: string;
  is_active: boolean;
  discount_percentage: number;
  stock_quantity: number | null;
  track_stock: boolean;
  sizes: string;
  colors: string;
}

export const exportProductsToCSV = async (): Promise<string> => {
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      categories(name),
      brands(name)
    `)
    .order('name');

  if (error) throw error;

  const headers = [
    'الاسم',
    'الوصف',
    'السعر',
    'التصنيف',
    'العلامة التجارية',
    'رابط الصورة',
    'نشط',
    'نسبة الخصم',
    'الكمية',
    'تتبع المخزون',
    'المقاسات',
    'الألوان'
  ];

  const rows = products?.map(product => {
    const options = product.options as any || {};
    const sizes = (options.sizes || []).map((s: any) => 
      typeof s === 'string' ? s : s.name
    ).join(', ');
    const colors = (options.colors || []).join(', ');

    return [
      product.name,
      product.description || '',
      product.price,
      (product.categories as any)?.name || '',
      (product.brands as any)?.name || '',
      product.image_url || '',
      product.is_active ? 'نعم' : 'لا',
      product.discount_percentage || 0,
      product.stock_quantity ?? '',
      product.track_stock ? 'نعم' : 'لا',
      sizes,
      colors
    ];
  }) || [];

  // Create CSV with BOM for Arabic support
  const BOM = '\uFEFF';
  const csvContent = BOM + [
    headers.join(','),
    ...rows.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    )
  ].join('\n');

  return csvContent;
};

export const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const parseCSVFile = (file: File): Promise<string[][]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        // Remove BOM if present
        const cleanText = text.replace(/^\uFEFF/, '');
        
        const lines = cleanText.split(/\r?\n/).filter(line => line.trim());
        const rows = lines.map(line => {
          const matches = line.match(/("([^"]*(?:""[^"]*)*)"|[^,]*)/g) || [];
          return matches.map(cell => 
            cell.replace(/^"|"$/g, '').replace(/""/g, '"').trim()
          );
        });
        
        resolve(rows);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export const importProductsFromCSV = async (
  rows: string[][],
  onProgress?: (current: number, total: number) => void
): Promise<{ success: number; failed: number; errors: string[] }> => {
  // Skip header row
  const dataRows = rows.slice(1);
  
  // Get categories and brands for lookup
  const { data: categories } = await supabase.from('categories').select('id, name');
  const { data: brands } = await supabase.from('brands').select('id, name');
  
  const categoryMap = new Map(categories?.map(c => [c.name, c.id]) || []);
  const brandMap = new Map(brands?.map(b => [b.name, b.id]) || []);
  
  let success = 0;
  let failed = 0;
  const errors: string[] = [];
  
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    onProgress?.(i + 1, dataRows.length);
    
    try {
      const [
        name,
        description,
        priceStr,
        categoryName,
        brandName,
        imageUrl,
        isActiveStr,
        discountStr,
        stockStr,
        trackStockStr,
        sizesStr,
        colorsStr
      ] = row;
      
      if (!name || !priceStr) {
        errors.push(`صف ${i + 2}: الاسم والسعر مطلوبان`);
        failed++;
        continue;
      }
      
      const categoryId = categoryMap.get(categoryName) || null;
      const brandId = brandMap.get(brandName) || null;
      
      const sizes = sizesStr 
        ? sizesStr.split(',').map(s => ({ name: s.trim(), price_type: 'base', price_value: null }))
        : [];
      const colors = colorsStr ? colorsStr.split(',').map(c => c.trim()) : [];
      
      const productData = {
        name,
        description: description || null,
        price: parseFloat(priceStr) || 0,
        category_id: categoryId,
        brand_id: brandId,
        image_url: imageUrl || null,
        is_active: isActiveStr === 'نعم',
        discount_percentage: parseFloat(discountStr) || 0,
        stock_quantity: stockStr ? parseInt(stockStr) : null,
        track_stock: trackStockStr === 'نعم',
        options: { sizes, colors, addons: [], customVariants: [] }
      };
      
      const { error } = await supabase.from('products').insert(productData);
      
      if (error) {
        errors.push(`صف ${i + 2}: ${error.message}`);
        failed++;
      } else {
        success++;
      }
    } catch (error: any) {
      errors.push(`صف ${i + 2}: ${error.message}`);
      failed++;
    }
  }
  
  return { success, failed, errors };
};
