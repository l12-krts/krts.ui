import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { usePrefersReducedMotion } from './usePerceived';

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface AnimatedWidthOptions {
  enabled?: boolean;
  /** ms. Default 250. */
  duration?: number;
}

/**
 * Smoothly resizes a box when its content changes ("Save" → "Saved ✓").
 *
 * Attach `contentRef` to an element that hugs the content (it must not
 * shrink — give it `shrink-0`). The host gets an explicit, transitioned
 * `width` = content width + the host's padding and border.
 *
 * The first measurement (and the swap to web fonts) is applied without
 * animation, so nothing slides around on page load.
 */
export function useAnimatedWidth({ enabled = true, duration = 250 }: AnimatedWidthOptions = {}) {
  const contentRef = useRef<HTMLElement | null>(null);
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const reduced = usePrefersReducedMotion();

  const measure = useCallback(() => {
    const content = contentRef.current;
    const host = content?.parentElement;
    if (!content || !host) return;
    const cs = getComputedStyle(host);
    const chrome =
      parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
    const next = Math.ceil(content.getBoundingClientRect().width + chrome);
    setWidth((prev) => (prev === next ? prev : next));
  }, []);

  useIsoLayoutEffect(() => {
    if (!enabled) {
      setWidth(undefined);
      return undefined;
    }
    const content = contentRef.current;
    if (!content || typeof ResizeObserver === 'undefined') return undefined;
    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(content);
    return () => ro.disconnect();
  }, [enabled, measure]);

  // Only animate once the first layout (and web fonts) have settled.
  useEffect(() => {
    if (!enabled || width === undefined || ready) return undefined;
    let cancelled = false;
    const fonts = typeof document !== 'undefined' && document.fonts ? document.fonts.ready : Promise.resolve();
    fonts.then(() => {
      requestAnimationFrame(() => {
        if (!cancelled) setReady(true);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, width, ready]);

  const style: CSSProperties | undefined =
    enabled && width !== undefined ? { width } : undefined;

  return {
    contentRef,
    /** Spread into the host's `style`. */
    widthStyle: style,
    /** Append to the host's `transition` list. */
    widthTransition: enabled && ready && !reduced ? `width ${duration}ms var(--ease-out)` : '',
  };
}
