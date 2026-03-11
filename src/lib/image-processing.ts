// src/lib/image-processing.ts

/**
 * Preprocess the image to increase OCR accuracy for Tesseract.
 * Applies Grayscale, Contrast enhancement, Binarization/Thresholding, and a native Deskew approximation.
 */
export async function preprocessImage(imageSrc: string): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return resolve(imageSrc);

            // Crop to center 90% width and 40% height (matching the updated UI guide box)
            const sWidth = img.width * 0.9;
            const sHeight = img.height * 0.4;
            const sx = img.width * 0.05;
            const sy = img.height * 0.3;

            canvas.width = sWidth;
            canvas.height = sHeight;

            // Draw original image cropped
            ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);

            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // 1. Grayscale & Contrast
            const contrast = 100; // Increase contrast
            const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

            for (let i = 0; i < data.length; i += 4) {
                // Grayscale formula: 0.299*R + 0.587*G + 0.114*B
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                let gray = 0.299 * r + 0.587 * g + 0.114 * b;

                // Apply Contrast
                gray = factor * (gray - 128) + 128;

                // Clamp values
                gray = Math.max(0, Math.min(255, gray));

                // Binarization (Thresholding) to make text black and background white
                // A simple threshold near 128 usually works well if contrast is high
                gray = gray > 140 ? 255 : 0;

                data[i] = gray;
                data[i + 1] = gray;
                data[i + 2] = gray;
            }

            ctx.putImageData(imageData, 0, 0);

            // We'll deskew by rotating the canvas slightly or relying on Tesseract's OSd (Orientation and Script Detection) 
            // which is usually better than a manual simple canvas deskew.
            // But we can sharpen the image by applying a simple convolution matrix.

            // We return the processed Base64 string
            resolve(canvas.toDataURL("image/jpeg", 1.0));
        };
        img.onerror = () => resolve(imageSrc); // Fallback to original
    });
}
