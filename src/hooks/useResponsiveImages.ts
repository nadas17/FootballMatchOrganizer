import { useMemo } from 'react';

export const useResponsiveImages = () => {
  const shouldUseWebP = useMemo(() => {
    // WebP support detection
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    return ctx && canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }, []);

  const shouldReduceAnimations = useMemo(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const isMobile = useMemo(() => {
    return window.innerWidth < 768;
  }, []);

  return {
    shouldUseWebP,
    shouldReduceAnimations,
    isMobile
  };
};