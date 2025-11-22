/**
 * Hook for lazy loading content
 * Implements Task 11.2 - Implement lazy loading
 * 
 * Features:
 * - Lazy load issue content on scroll
 * - Lazy decrypt premium sections on demand
 * - Paginate issue lists
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseLazyLoadOptions {
  threshold?: number; // Intersection observer threshold (0-1)
  rootMargin?: string; // Root margin for intersection observer
}

/**
 * Hook for lazy loading elements when they come into view
 */
export function useLazyLoad<T extends HTMLElement = HTMLDivElement>(
  options: UseLazyLoadOptions = {}
) {
  const { threshold = 0.1, rootMargin = '50px' } = options;
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // If already loaded, don't observe again
    if (hasLoaded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            setHasLoaded(true);
            // Stop observing once loaded
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, hasLoaded]);

  return {
    elementRef,
    isVisible,
    hasLoaded,
  };
}

/**
 * Hook for paginating a list of items
 */
export function usePagination<T>(items: T[], itemsPerPage: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedItems, setDisplayedItems] = useState<T[]>([]);

  // Calculate total pages
  const totalPages = Math.ceil(items.length / itemsPerPage);

  // Update displayed items when page or items change
  useEffect(() => {
    const startIndex = 0;
    const endIndex = currentPage * itemsPerPage;
    setDisplayedItems(items.slice(startIndex, endIndex));
  }, [items, currentPage, itemsPerPage]);

  const loadMore = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalPages]);

  const reset = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const hasMore = currentPage < totalPages;

  return {
    displayedItems,
    currentPage,
    totalPages,
    hasMore,
    loadMore,
    reset,
  };
}

/**
 * Hook for infinite scroll loading
 */
export function useInfiniteScroll(
  callback: () => void,
  options: {
    threshold?: number;
    rootMargin?: string;
    enabled?: boolean;
  } = {}
) {
  const { threshold = 0.1, rootMargin = '100px', enabled = true } = options;
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback();
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current && sentinel) {
        observerRef.current.unobserve(sentinel);
      }
    };
  }, [callback, threshold, rootMargin, enabled]);

  return { sentinelRef };
}
