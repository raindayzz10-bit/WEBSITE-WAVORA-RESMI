/**
 * High-Definition Client-Side Image Compressor
 * Produces crisp, high-resolution photos optimized for Cloud Firestore and web loading
 */

export function compressImage(
  file: File,
  maxWidth = 1080,
  maxHeight = 1080,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    let objectUrl: string | null = null;
    let isCleanedUp = false;

    const cleanup = () => {
      if (isCleanedUp) return;
      isCleanedUp = true;
      if (objectUrl) {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch {
          // ignore
        }
      }
    };

    const processImg = (img: HTMLImageElement) => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (!width || !height) {
          width = 800;
          height = 600;
        }

        // Pertahankan rasio aspek dan sesuaikan ke batas maksimal yang aman
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          cleanup();
          reject(new Error('Canvas context not available'));
          return;
        }

        // Terapkan kualitas smoothing tertinggi agar foto tajam & jernih
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Latar belakang gelap elegan untuk gambar PNG transparan
        ctx.fillStyle = '#050B14';
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);

        // Coba format WebP terlebih dahulu (efisiensi tinggi & tajam)
        try {
          const webpData = canvas.toDataURL('image/webp', quality);
          // Jika ukuran aman untuk Cloud Firestore (< 480KB), gunakan langsung
          if (webpData.startsWith('data:image/webp') && webpData.length < 500000) {
            cleanup();
            resolve(webpData);
            return;
          }
        } catch {
          // Fallback to jpeg
        }

        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        // Jika masih lebih dari 450KB, turunkan kompresi sedikit agar selalu aman di Firestore
        if (dataUrl.length > 500000) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.70);
        }
        if (dataUrl.length > 500000) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.58);
        }

        cleanup();
        resolve(dataUrl);
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    try {
      if (typeof URL !== 'undefined' && URL.createObjectURL) {
        objectUrl = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => processImg(img);
        img.onerror = () => {
          cleanup();
          // Fallback langsung ke FileReader jika createObjectURL diblokir
          const reader = new FileReader();
          reader.onload = (e) => {
            const fallbackImg = new Image();
            fallbackImg.onload = () => processImg(fallbackImg);
            fallbackImg.onerror = (err2) => reject(err2);
            fallbackImg.src = e.target?.result as string;
          };
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        };
        img.src = objectUrl;
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const fallbackImg = new Image();
          fallbackImg.onload = () => processImg(fallbackImg);
          fallbackImg.onerror = (err2) => reject(err2);
          fallbackImg.src = e.target?.result as string;
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fallbackImg = new Image();
        fallbackImg.onload = () => processImg(fallbackImg);
        fallbackImg.onerror = (err2) => reject(err2);
        fallbackImg.src = e.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    }
  });
}
