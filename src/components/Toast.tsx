import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { CheckIcon, XIcon } from './icons';
import { Spinner } from './Spinner';

/* ── store ────────────────────────────────────────────────────────────── */

export type ToastType = 'default' | 'success' | 'error' | 'loading';

export interface ToastAction {
  label: ReactNode;
  onPress: () => void;
}

export interface ToastOptions {
  id?: string | number;
  description?: ReactNode;
  /** ms before auto-dismiss. `Infinity` keeps it. Default 4000 (loading: Infinity). */
  duration?: number;
  action?: ToastAction;
  onDismiss?: () => void;
}

interface ToastRecord extends ToastOptions {
  id: string | number;
  title: ReactNode;
  type: ToastType;
  createdAt: number;
  removing?: boolean;
}

let toasts: ToastRecord[] = [];
let counter = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

function upsert(title: ReactNode, type: ToastType, opts: ToastOptions = {}) {
  const id = opts.id ?? ++counter;
  const existing = toasts.find((t) => t.id === id);
  if (existing) {
    // Updating in place (e.g. loading → success) keeps position and restarts the timer.
    toasts = toasts.map((t) => (t.id === id ? { ...t, ...opts, title, type, createdAt: Date.now(), removing: false } : t));
  } else {
    toasts = [...toasts, { ...opts, id, title, type, createdAt: Date.now() }];
  }
  emit();
  return id;
}

function dismiss(id?: string | number) {
  toasts = toasts.map((t) => (id === undefined || t.id === id ? { ...t, removing: true } : t));
  emit();
}

function remove(id: string | number) {
  const t = toasts.find((x) => x.id === id);
  toasts = toasts.filter((x) => x.id !== id);
  t?.onDismiss?.();
  emit();
}

/**
 * Call from anywhere — no hooks or context needed. Render `<Toaster />` once.
 *
 * ```ts
 * toast('Saved');
 * toast.success('Uploaded', { description: 'photo.jpg' });
 * toast('Message archived', { action: { label: 'Undo', onPress: restore } });
 * toast.promise(save(), { loading: 'Saving…', success: 'Saved', error: 'Failed' });
 * ```
 */
export const toast = Object.assign((title: ReactNode, opts?: ToastOptions) => upsert(title, 'default', opts), {
  success: (title: ReactNode, opts?: ToastOptions) => upsert(title, 'success', opts),
  error: (title: ReactNode, opts?: ToastOptions) => upsert(title, 'error', opts),
  loading: (title: ReactNode, opts?: ToastOptions) => upsert(title, 'loading', opts),
  dismiss,
  promise<T>(
    promise: Promise<T>,
    msgs: { loading: ReactNode; success: ReactNode | ((v: T) => ReactNode); error: ReactNode | ((e: unknown) => ReactNode) },
    opts?: ToastOptions,
  ) {
    const id = upsert(msgs.loading, 'loading', opts);
    promise.then(
      (v) => upsert(typeof msgs.success === 'function' ? msgs.success(v) : msgs.success, 'success', { ...opts, id }),
      (e) => upsert(typeof msgs.error === 'function' ? msgs.error(e) : msgs.error, 'error', { ...opts, id }),
    );
    return promise;
  },
});

/* ── UI ───────────────────────────────────────────────────────────────── */

export interface ToasterProps {
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left' | 'top-right' | 'top-center' | 'top-left';
  /** How many toasts are visible in the collapsed stack. Default 3. */
  visibleToasts?: number;
  /** Always show the stack expanded. */
  expand?: boolean;
}

const GAP = 10;

export function Toaster({ position = 'bottom-right', visibleToasts = 3, expand = false }: ToasterProps) {
  const list = useSyncExternalStore(subscribe, () => toasts, () => toasts);
  const [hovered, setHovered] = useState(false);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const isTop = position.startsWith('top');
  const expanded = expand || hovered;

  // Pause timers while the tab is hidden: nobody saw that toast.
  const [docHidden, setDocHidden] = useState(false);
  useEffect(() => {
    const on = () => setDocHidden(document.hidden);
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);

  useEffect(() => {
    if (list.length === 0) setHovered(false);
  }, [list.length]);

  const ordered = [...list].reverse(); // newest first
  const visible = ordered.filter((t) => !t.removing);
  const frontHeight = heights[String(visible[0]?.id)] ?? 56;

  return (
    <section
      aria-label="Notifications"
      tabIndex={-1}
      className={cn(
        'pointer-events-none fixed z-[100] w-[min(360px,calc(100vw-32px))]',
        isTop ? 'top-4' : 'bottom-4',
        position.endsWith('right') ? 'right-4' : position.endsWith('left') ? 'left-4' : 'left-1/2 -translate-x-1/2',
      )}
    >
      <ol
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="pointer-events-auto relative"
        // Fill the gaps between expanded toasts so hover doesn't flicker.
        style={{
          height: expanded
            ? visible.reduce((sum, t) => sum + (heights[String(t.id)] ?? 56) + GAP, 0)
            : list.length
              ? frontHeight
              : 0,
        }}
      >
        {ordered.map((t) => {
          const index = visible.indexOf(t);
          const offset = expanded
            ? visible.slice(0, Math.max(0, index)).reduce((sum, x) => sum + (heights[String(x.id)] ?? 56) + GAP, 0)
            : Math.max(0, index) * 12;
          return (
            <ToastItem
              key={t.id}
              toast={t}
              index={index}
              isTop={isTop}
              expanded={expanded}
              offset={offset}
              hiddenInStack={index >= visibleToasts}
              collapsedHeight={frontHeight}
              paused={hovered || docHidden}
              onHeight={(h) => setHeights((p) => (p[String(t.id)] === h ? p : { ...p, [String(t.id)]: h }))}
            />
          );
        })}
      </ol>
    </section>
  );
}

const typeIcon: Record<ToastType, ReactNode> = {
  default: null,
  success: (
    <span className="grid size-5 place-items-center rounded-full bg-success text-white">
      <CheckIcon size={12} />
    </span>
  ),
  error: (
    <span className="grid size-5 place-items-center rounded-full bg-danger text-white">
      <XIcon size={12} />
    </span>
  ),
  loading: <Spinner size={16} className="text-fg-muted" />,
};

function ToastItem({
  toast: t,
  index,
  isTop,
  expanded,
  offset,
  hiddenInStack,
  collapsedHeight,
  paused,
  onHeight,
}: {
  toast: ToastRecord;
  index: number;
  isTop: boolean;
  expanded: boolean;
  offset: number;
  hiddenInStack: boolean;
  collapsedHeight: number;
  paused: boolean;
  onHeight: (h: number) => void;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const [mounted, setMounted] = useState(false);
  const drag = useRef<{ x: number; y: number; t: number; id: number } | null>(null);
  const removing = !!t.removing;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prev = el.style.height;
    el.style.height = 'auto';
    onHeight(el.getBoundingClientRect().height);
    el.style.height = prev;
  }, [t.title, t.description, t.action, t.type]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const r = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(r);
  }, []);

  // Auto-dismiss with pause/resume that remembers elapsed time.
  const remaining = useRef<number>(t.duration ?? (t.type === 'loading' ? Infinity : 4000));
  useEffect(() => {
    remaining.current = t.duration ?? (t.type === 'loading' ? Infinity : 4000);
  }, [t.createdAt, t.duration, t.type]);
  useEffect(() => {
    if (removing || paused || !Number.isFinite(remaining.current)) return;
    const start = Date.now();
    const timer = setTimeout(() => dismiss(t.id), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - start;
    };
  }, [paused, removing, t.id, t.createdAt]);

  useEffect(() => {
    if (!removing) return;
    const timer = setTimeout(() => remove(t.id), 200);
    return () => clearTimeout(timer);
  }, [removing, t.id]);

  const dir = isTop ? 1 : -1;
  const visible = mounted && !removing && !hiddenInStack;
  const scale = expanded || index <= 0 ? 1 : Math.max(0.8, 1 - index * 0.05);
  const transform = `translateY(${!mounted || removing ? `${isTop ? -100 : 100}%` : `${dir * offset}px`}) scale(${scale})`;

  return (
    <li
      ref={ref}
      role={t.type === 'error' ? 'alert' : 'status'}
      aria-live={t.type === 'error' ? 'assertive' : 'polite'}
      aria-atomic
      tabIndex={0}
      data-front={index === 0 || undefined}
      onKeyDown={(e) => {
        if (e.key === 'Escape') dismiss(t.id);
      }}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        if (drag.current) return; // ignore extra fingers
        drag.current = { x: e.clientX, y: e.clientY, t: Date.now(), id: e.pointerId };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d || d.id !== e.pointerId || !ref.current) return;
        const dx = e.clientX - d.x;
        // Update transform directly (not a CSS var) to avoid restyling children.
        ref.current.style.transition = 'none';
        ref.current.style.transform = `translateY(${dir * offset}px) translateX(${dx}px)`;
        ref.current.style.opacity = String(Math.max(0, 1 - Math.abs(dx) / 260));
      }}
      onPointerUp={(e) => {
        const d = drag.current;
        drag.current = null;
        if (!d || !ref.current) return;
        const dx = e.clientX - d.x;
        const velocity = Math.abs(dx) / Math.max(1, Date.now() - d.t);
        ref.current.style.transition = '';
        ref.current.style.opacity = '';
        // A quick flick is enough; no need to drag past a threshold.
        if (Math.abs(dx) > 80 || velocity > 0.11) {
          ref.current.style.transform = `translateX(${dx > 0 ? 120 : -120}%)`;
          ref.current.style.opacity = '0';
          dismiss(t.id);
        } else {
          ref.current.style.transform = '';
        }
      }}
      onPointerCancel={() => {
        drag.current = null;
        if (ref.current) {
          ref.current.style.transition = '';
          ref.current.style.transform = '';
          ref.current.style.opacity = '';
        }
      }}
      className={cn(
        'absolute inset-x-0 flex touch-none items-start gap-3 overflow-hidden rounded-[12px] border border-line-subtle bg-overlay p-3.5 text-fg shadow-float outline-none select-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
        // Transitions, not keyframes: toasts arrive in bursts and must retarget smoothly.
        'transition-[transform,opacity,height] duration-400 ease-[ease] motion-reduce:transition-opacity',
        isTop ? 'top-0 origin-bottom' : 'bottom-0 origin-top',
      )}
      style={{
        transform,
        opacity: visible ? 1 : 0,
        zIndex: 100 - Math.max(0, index),
        height: !expanded && index > 0 ? collapsedHeight : undefined,
        pointerEvents: hiddenInStack ? 'none' : undefined,
      }}
    >
      {typeIcon[t.type] && <span className="mt-px shrink-0">{typeIcon[t.type]}</span>}
      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col gap-0.5 transition-opacity duration-200',
          !expanded && index > 0 && 'opacity-0',
        )}
      >
        <div className="text-[14.5px] font-medium leading-snug">{t.title}</div>
        {t.description && <div className="text-[13.5px] leading-snug text-fg-muted">{t.description}</div>}
      </div>
      {t.action && (
        <button
          type="button"
          onClick={() => {
            t.action!.onPress();
            dismiss(t.id);
          }}
          className="h-7 shrink-0 rounded-md bg-primary px-2.5 text-[13px] font-medium text-primary-fg transition-transform duration-150 ease-out outline-none active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          {t.action.label}
        </button>
      )}
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => dismiss(t.id)}
        className="-mt-0.5 -mr-1 grid size-6 shrink-0 place-items-center rounded-md text-fg-subtle outline-none transition-colors duration-150 hover:bg-surface-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-focus"
      >
        <XIcon size={13} />
      </button>
    </li>
  );
}
