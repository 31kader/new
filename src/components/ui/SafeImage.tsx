import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getLocalImage, cacheImage } from '../../services/imageCache';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
  containerClassName?: string;
}

export const isBadUrl = (url: any): boolean => {
  if (typeof url !== 'string') return false;
  const u = url.toLowerCase();
  return u.includes('aistudio.google.com') ||
         u.includes('/aistudio/') ||
         (u.includes('/_/') && u.includes('/upload/') && u.includes('/file/')) ||
         u.includes('eb137f4a-fb23-4b8c-aec9-844aecbc242a');
};

export const SafeImage: React.FC<SafeImageProps> = ({ 
  src, 
  alt, 
  className, 
  fallback, 
  containerClassName,
  ...props 
}) => {
  const [error, setError] = useState(false);
  const [displaySrc, setDisplaySrc] = useState<string | undefined>(src);

  useEffect(() => {
    let active = true;
    if (src && !isBadUrl(src)) {
      getLocalImage(src).then(cachedUrl => {
        if (!active) return;
        if (cachedUrl) {
          setDisplaySrc(cachedUrl);
        } else {
          setDisplaySrc(src);
          cacheImage(src).then(cachedUrl => {
            if (active && cachedUrl) {
              setDisplaySrc(cachedUrl);
            }
          });
        }
      });
    } else {
      setDisplaySrc(src);
    }
    return () => {
      active = false;
    };
  }, [src]);

  if (!displaySrc || isBadUrl(displaySrc) || error) {
    return (
      <div className={cn("flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg", containerClassName || className)}>
        {fallback || <Package className="text-slate-400" size={24} />}
      </div>
    );
  }

  return (
    <img
      src={displaySrc}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      referrerPolicy="no-referrer"
      {...props}
    />
  );
};
