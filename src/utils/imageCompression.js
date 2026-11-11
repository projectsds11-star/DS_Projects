/**
 * Shared client-side Canvas image compression helper.
 * Keeps candidate photos and scanned documents lightweight without external dependencies.
 */
export function compressImageFile(
  file,
  { maxWidth = 1600, maxHeight = 1600, quality = 0.85, outputType = 'image/jpeg' } = {}
) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not initialize image canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Compression failed'));
            return;
          }
          const nextName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
          const compressed = new File([blob], nextName, {
            type: outputType,
            lastModified: Date.now(),
          });
          resolve(compressed);
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not load image'));
    };

    img.src = objectUrl;
  });
}

