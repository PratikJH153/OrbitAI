import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ImageLoaderProps {
  src: string;
  alt: string;
  className?: string;
}

const ImageLoader: React.FC<ImageLoaderProps> = ({ src, alt, className = "w-full h-auto" }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset states when src changes
    setIsLoading(true);
    setError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  return (
    <div className="relative w-full">
      {/* Placeholder while loading */}
      {isLoading && (
        <div className="w-full h-48 bg-gray-800/50 rounded-lg"></div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 rounded-lg">
          <div className="relative w-20 h-20">
            {/* Circular loading animation */}
            <motion.div
              className="absolute inset-0 border-4 border-emerald-500/30 rounded-full"
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{
                rotate: {
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "linear"
                },
                scale: {
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut"
                }
              }}
            />
            <motion.div
              className="absolute inset-0 border-t-4 border-emerald-500 rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                repeat: Infinity,
                duration: 1,
                ease: "linear"
              }}
            />
          </div>
          <p className="mt-2 text-sm text-emerald-400 animate-pulse">Loading image...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-center h-40 bg-red-500/10 rounded-lg">
          <p className="text-red-400">Failed to load image</p>
        </div>
      )}

      {/* Actual image (hidden until loaded) */}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading || error ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

export default ImageLoader;
