import { useEffect, useRef, useState } from 'react';

/**
 * Honest-but-kind loading state.
 *
 * - Don't flash a spinner for work that finishes almost instantly
 *   (`delay`, default 150ms).
 * - Once a spinner *is* shown, keep it up long enough to read
 *   (`minDuration`, default 500ms) so it never flickers.
 */
export function useSmoothPending(isPending: boolean, { delay = 150, minDuration = 500 } = {}): boolean {
  const [shown, setShown] = useState(false);
  const shownAt = useRef(0);

  useEffect(() => {
    if (isPending && !shown) {
      const t = setTimeout(() => {
        shownAt.current = Date.now();
        setShown(true);
      }, delay);
      return () => clearTimeout(t);
    }
    if (!isPending && shown) {
      const remaining = Math.max(0, minDuration - (Date.now() - shownAt.current));
      const t = setTimeout(() => setShown(false), remaining);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [isPending, shown, delay, minDuration]);

  return shown;
}

/**
 * Progress for work whose real progress is unknown. Moves fast at first,
 * then eases toward `ceiling` (never claiming to be done), and jumps to
 * 100 the moment `isDone` flips. Returns a 0–100 number.
 */
export function usePerceivedProgress(
  isRunning: boolean,
  isDone: boolean,
  { expectedDuration = 3000, ceiling = 92 } = {},
): number {
  const [value, setValue] = useState(0);
  const start = useRef<number | null>(null);

  useEffect(() => {
    if (isDone) {
      setValue(100);
      start.current = null;
      return undefined;
    }
    if (!isRunning) {
      setValue(0);
      start.current = null;
      return undefined;
    }
    start.current = typeof performance !== 'undefined' ? performance.now() : Date.now();
    let raf = 0;
    const tick = () => {
      const t = (performance.now() - (start.current ?? 0)) / expectedDuration;
      // 1 - e^(-kt): front-loaded, asymptotic to the ceiling.
      setValue(ceiling * (1 - Math.exp(-2.2 * t)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isRunning, isDone, expectedDuration, ceiling]);

  return value;
}

/** True when the user asked the OS for reduced motion. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof matchMedia === 'undefined') return undefined;
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}
