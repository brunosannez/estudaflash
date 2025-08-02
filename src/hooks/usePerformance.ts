import { useState, useEffect } from 'react';

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    isSlowConnection: false
  });

  useEffect(() => {
    // Monitor page load performance
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      setMetrics(prev => ({
        ...prev,
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        renderTime: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
      }));
    }

    // Monitor memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memory.usedJSHeapSize / memory.totalJSHeapSize
      }));
    }

    // Detect slow connections
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setMetrics(prev => ({
        ...prev,
        isSlowConnection: connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g'
      }));
    }
  }, []);

  const reportMetric = (name: string, value: number) => {
    // In production, this would send to analytics
    console.log(`📊 Performance metric - ${name}: ${value}ms`);
  };

  return { metrics, reportMetric };
};

export const useMobileOptimizations = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    // Check if app is installed (PWA)
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  const enableReducedMotion = () => {
    document.documentElement.style.setProperty('--animation-duration', '0s');
  };

  const disableReducedMotion = () => {
    document.documentElement.style.removeProperty('--animation-duration');
  };

  return {
    isMobile,
    orientation,
    isInstalled,
    enableReducedMotion,
    disableReducedMotion
  };
};