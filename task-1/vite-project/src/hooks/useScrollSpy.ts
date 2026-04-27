import { useState, useEffect, useRef } from 'react';

export const useScrollSpy = (sectionIds: string[], scrollContainerRef: React.RefObject<HTMLElement | null>) => {
  const [highestReached, setHighestReached] = useState<number>(-1);
  const observedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-section-id');
          if (!id) return;
          const idx = sectionIds.indexOf(id);

          if (entry.isIntersecting && !observedRef.current.has(id)) {
            observedRef.current.add(id);
            setHighestReached((prev) => Math.max(prev, idx));
          }
        });
      },
      {
        root: container,
        threshold: 0.15,
      }
    );

    sectionIds.forEach((id) => {
      const el = document.querySelector(`[data-section-id="${id}"]`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sectionIds, scrollContainerRef]);

  return highestReached;
};
