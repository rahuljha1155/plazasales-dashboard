import { useEffect, useRef, useState } from "react";

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

// Custom color extraction using canvas - more reliable than external libraries
function extractColorsFromImage(img: HTMLImageElement, colorCount: number = 6): Array<[number, number, number]> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return [];

  // Scale down for performance
  const maxSize = 100;
  const scale = Math.min(maxSize / img.width, maxSize / img.height);
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  
  // Color quantization using simple clustering
  const colorMap: Map<string, { rgb: [number, number, number], count: number }> = new Map();
  
  // Sample every nth pixel for performance
  const step = 4;
  for (let i = 0; i < pixels.length; i += step * 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    
    // Skip transparent or very light/dark pixels
    if (a < 125 || (r > 250 && g > 250 && b > 250) || (r < 10 && g < 10 && b < 10)) {
      continue;
    }
    
    // Quantize colors to reduce variation
    const qr = Math.round(r / 10) * 10;
    const qg = Math.round(g / 10) * 10;
    const qb = Math.round(b / 10) * 10;
    const key = `${qr},${qg},${qb}`;
    
    if (colorMap.has(key)) {
      colorMap.get(key)!.count++;
    } else {
      colorMap.set(key, { rgb: [qr, qg, qb], count: 1 });
    }
  }
  
  // Sort by frequency and return top colors
  return Array.from(colorMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, colorCount)
    .map(c => c.rgb);
}

export default function ImageColorPalette({ 
  src, 
  colorCount = 6,
  onColorSelect 
}: {
  src: string;
  colorCount?: number;
  onColorSelect?: (color: string) => void;
}) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [colors, setColors] = useState<{ rgb: string; hex: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!src) {
      setColors([]);
      return;
    }

    setIsLoading(true);
    setColors([]);

    const img = new Image();
    
    // Handle CORS properly
    if (!src.startsWith('data:')) {
      img.crossOrigin = "anonymous";
    }

    img.onload = () => {
      try {
        const palette = extractColorsFromImage(img, colorCount);
        
        if (palette && palette.length > 0) {
          const extractedColors = palette.map((c) => ({
            rgb: `rgb(${c[0]}, ${c[1]}, ${c[2]})`,
            hex: rgbToHex(c[0], c[1], c[2]),
          }));
          
          setColors(extractedColors);
        } else {
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    img.onerror = (error) => {
      setIsLoading(false);
    };

    img.src = src;

    // Store ref for cleanup
    if (imgRef.current) {
      imgRef.current.src = src;
    }
  }, [src, colorCount]);

  if (isLoading) {
    return (
      <div className="flex gap-2 mt-3">
        {[...Array(colorCount)].map((_, i) => (
          <div
            key={i}
            className="w-12 h-12 rounded-lg border-2 border-zinc-300 bg-zinc-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      <img
        ref={imgRef}
        src={src}
        alt="color-analysis"
        style={{ display: "none" }}
      />

      <div className="flex gap-2 mt-3 flex-wrap">
        {colors.length === 0 && !isLoading ? (
          <p className="text-sm text-zinc-500">Upload an image to detect colors</p>
        ) : (
          colors.map((color, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onColorSelect?.(color.hex)}
              className="group relative"
              title={`Click to use ${color.hex}`}
            >
              <div
                className="size-10 rounded-lg border-2 border-zinc-300 hover:border-orange-500 hover:scale-110 transition-all cursor-pointer "
                style={{ background: color.rgb }}
              />
             
            </button>
          ))
        )}
      </div>
    </div>
  );
}
