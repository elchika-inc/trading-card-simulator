import { useState } from "react";

interface ImageWithFallbackProps {
  src: string;
  fallback: string;
  alt: string;
  className?: string;
}

export function ImageWithFallback({
  src,
  fallback,
  alt,
  className,
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => setImgSrc(fallback)}
    />
  );
}
