import { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  maxPull?: number;
}

export function usePullToRefresh({ onRefresh, threshold = 80, maxPull = 120 }: UsePullToRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const pullDistanceRef = useRef(0);
  const isRefreshingRef = useRef(false);

  // Sync refs with state
  useEffect(() => {
    pullDistanceRef.current = pullDistance;
  }, [pullDistance]);

  useEffect(() => {
    isRefreshingRef.current = isRefreshing;
  }, [isRefreshing]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchStartY = 0;
    let scrollTop = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      scrollTop = window.scrollY || container.scrollTop;
      startY.current = touchStartY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Only allow pull to refresh when at the top of the page
      if (scrollTop > 5) return;
      if (isRefreshingRef.current) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - touchStartY;

      if (diff > 0) {
        setIsPulling(true);
        const distance = Math.min(diff * 0.5, maxPull);
        pullDistanceRef.current = distance;
        setPullDistance(distance);

        // Prevent default scrolling when pulling
        if (diff > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      const currentPullDistance = pullDistanceRef.current;
      if (currentPullDistance >= threshold && !isRefreshingRef.current) {
        setIsRefreshing(true);
        isRefreshingRef.current = true;
        try {
          await onRefresh();
        } finally {
          setTimeout(() => {
            setIsRefreshing(false);
            isRefreshingRef.current = false;
            setIsPulling(false);
            setPullDistance(0);
            pullDistanceRef.current = 0;
          }, 500);
        }
      } else {
        setIsPulling(false);
        setPullDistance(0);
        pullDistanceRef.current = 0;
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [threshold, maxPull, onRefresh]);

  const PullToRefreshIndicator = () => {
    if (!isPulling && !isRefreshing) return null;

    const rotation = Math.min((pullDistance / threshold) * 360, 360);
    const opacity = Math.min(pullDistance / threshold, 1);

    return (
      <div 
        className="fixed top-0 left-0 right-0 flex justify-center items-center z-50 transition-all duration-200"
        style={{ 
          transform: `translateY(${Math.min(pullDistance, maxPull)}px)`,
          opacity: opacity
        }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-xl">
          <RefreshCw 
            size={24} 
            className={`text-primary ${isRefreshing ? 'pull-refresh-spinner' : ''}`}
            style={{ 
              transform: `rotate(${rotation}deg)`,
              transition: isRefreshing ? 'none' : 'transform 0.2s'
            }}
          />
        </div>
      </div>
    );
  };

  return {
    containerRef,
    PullToRefreshIndicator,
    isRefreshing,
    isPulling
  };
}
