/**
 * Compress an image file before uploading
 * @param file - The original image file
 * @param maxWidth - Maximum width (default 1200px)
 * @param maxHeight - Maximum height (default 1200px)
 * @param quality - JPEG/WebP quality 0-1 (default 0.8)
 * @returns Compressed image as Blob
 */
export const compressImage = async (
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Use high quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log(`Image compressed: ${(file.size / 1024).toFixed(1)}KB → ${(blob.size / 1024).toFixed(1)}KB (${Math.round((1 - blob.size / file.size) * 100)}% reduction)`);
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/webp', // Use WebP for better compression
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Compress image and return as File object
 */
export const compressImageToFile = async (
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<File> => {
  const blob = await compressImage(file, maxWidth, maxHeight, quality);
  
  // Create new filename with .webp extension
  const originalName = file.name.replace(/\.[^/.]+$/, '');
  const newFileName = `${originalName}.webp`;
  
  return new File([blob], newFileName, { type: 'image/webp' });
};

/**
 * Check if file is an image
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};
