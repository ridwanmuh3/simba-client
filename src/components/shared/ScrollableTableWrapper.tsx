import { useRef, useState, useEffect, useCallback, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScrollableTableWrapperProps {
  children: ReactNode;
  className?: string;
}

export function ScrollableTableWrapper({
  children,
  className,
}: ScrollableTableWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(checkScroll);
    observer.observe(el);
    return () => observer.disconnect();
  }, [checkScroll]);

  return (
    <div className="relative">
      {canScrollLeft && (
        <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-background/90 to-transparent z-10" />
      )}
      <div
        ref={containerRef}
        className={cn("overflow-x-auto", className)}
        onScroll={checkScroll}
      >
        {children}
      </div>
      {canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-background/90 to-transparent z-10" />
      )}
    </div>
  );
}
