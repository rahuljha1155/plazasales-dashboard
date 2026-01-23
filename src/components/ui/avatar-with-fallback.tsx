import { useState } from "react";
import { User } from "lucide-react";

interface AvatarWithFallbackProps {
  src?: string | null;
  alt?: string;
  fallbackSrc?: string;
  className?: string;
  showIcon?: boolean;
}

export function AvatarWithFallback({
  src,
  alt = "Avatar",
  fallbackSrc = "/avatar/avatar2.png",
  className = "",
  showIcon = false,
}: AvatarWithFallbackProps) {
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setImgError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // If no src or error occurred, show fallback
  if (!src || imgError) {
    if (showIcon) {
      return (
        <div className={`flex items-center justify-center bg-gray-200 ${className}`}>
          <User className="w-1/2 h-1/2 text-gray-400" />
        </div>
      );
    }
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        className={className}
        onError={(e) => {
          // If fallback also fails, prevent infinite loop
          const target = e.target as HTMLImageElement;
          if (target.src !== fallbackSrc) {
            target.src = fallbackSrc;
          }
        }}
      />
    );
  }

  return (
    <>
      {isLoading && (
        <div className={`flex items-center justify-center bg-gray-100 animate-pulse ${className}`}>
          <User className="w-1/2 h-1/2 text-gray-300" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? "hidden" : ""}`}
        onError={handleError}
        onLoad={handleLoad}
      />
    </>
  );
}
