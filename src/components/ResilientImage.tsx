import React, { useState } from 'react';
import { User, Building2 } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackType?: 'avatar' | 'banner';
  initials?: string;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  className = '',
  fallbackType = 'avatar',
  initials = 'VF',
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    if (fallbackType === 'avatar') {
      return (
        <div
          className={`inline-flex items-center justify-center bg-slate-200 text-slate-700 font-semibold text-xs select-none ${className}`}
          aria-label={alt}
        >
          {initials || <User className="w-4 h-4 text-slate-500" />}
        </div>
      );
    }

    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300 p-6 ${className}`}
        aria-label={alt}
      >
        <Building2 className="w-8 h-8 text-slate-400 mb-2" />
        <span className="text-xs font-medium text-slate-300">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
