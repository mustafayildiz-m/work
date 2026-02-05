'use client';

import { useState } from 'react';
import Image from 'next/image';

const NewsImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  className = '', 
  style = {},
  fallbackSrc = 'https://images.unsplash.com/photo-1564769668426-4b7b0a0b8b8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  const handleLoad = () => {
    setHasError(false);
  };

  return (
    <Image
      src={imgSrc || fallbackSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={{
        ...style
      }}
      onError={handleError}
      onLoad={handleLoad}
      unoptimized={true} // Disable optimization to avoid 400 errors
    />
  );
};

export default NewsImage;
