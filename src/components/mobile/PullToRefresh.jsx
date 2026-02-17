import React, { useState, useRef, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PullToRefresh({ onRefresh, children }) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef(null);

  const threshold = 80;
  const maxPull = 120;

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (!startY.current || window.scrollY > 0) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, Math.min(currentY - startY.current, maxPull));
    
    if (distance > 0) {
      setPulling(true);
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true);
      setPulling(false);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
    setPulling(false);
    setPullDistance(0);
    startY.current = 0;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, refreshing]);

  return (
    <div ref={containerRef} className="relative">
      <AnimatePresence>
        {(pulling || refreshing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-40 flex items-center justify-center py-4"
            style={{ 
              backgroundColor: 'var(--warm-white)',
              transform: `translateY(${Math.min(pullDistance, maxPull) - 60}px)`
            }}
          >
            <motion.div
              animate={{ 
                rotate: refreshing ? 360 : pullDistance >= threshold ? 180 : 0,
                scale: refreshing ? 1 : Math.min(pullDistance / threshold, 1)
              }}
              transition={{ 
                rotate: refreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : { duration: 0.3 }
              }}
            >
              <RefreshCw 
                className="w-6 h-6" 
                style={{ color: 'var(--terracotta)' }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}