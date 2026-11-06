import { forwardRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { Link as RACLink, Separator as RACSeparator, type LinkProps, type SeparatorProps } from 'react-aria-components';
import { cn, composeTw, focusRing } from '../lib/cn';

/* ── Skeleton ─────────────────────────────────────────────────────────── */

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Render a circle (avatars). */
  circle?: boolean;
}

/**
 * Placeholder in the exact shape of the content to come, so the layout
 * doesn't jump when it arrives.
 */
export function Skeleton({ circle, className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden
      {...props}
      className={cn(
        'relative isolate overflow-hidden bg-surface-hover',
        circle ? 'rounded-full' : 'rounded-md',
        'after:absolute after:inset-0 after:-translate-x-full after:animate-krts-shimmer after:bg-gradient-to-r after:from-transparent after:via-bg/60 after:to-transparent',
        'motion-reduce:after:hidden',
        className,
      )}
    />
  );
}

/* ── Badge ────────────────────────────────────────────────────────────── */

const badgeTones = {
  neutral: 'bg-surface text-fg border-line',
  solid: 'bg-primary text-primary-fg border-primary-line',
  danger: 'bg-danger-soft text-danger border-danger/25',
  success: 'bg-success/10 text-success border-success/25',
  warning: 'bg-warning/10 text-warning border-warning/25',
} as const;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: keyof typeof badgeTones;
  /** Show a leading status dot. */
  dot?: boolean;
}

export function Badge({ tone = 'neutral', dot, className, children, ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={cn(
        'inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-[12.5px] font-medium leading-none whitespace-nowrap',
        badgeTones[tone],
        className,
      )}
    >
      {dot && <span aria-hidden className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/* ── Kbd ──────────────────────────────────────────────────────────────── */

export function Kbd({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      {...props}
      className={cn(
        'inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-line border-b-2 bg-surface px-1.5 font-sans text-[12px] text-fg-muted',
        className,
      )}
    />
  );
}

/* ── Avatar ───────────────────────────────────────────────────────────── */

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  src?: string;
  alt?: string;
  /** Used for initials when there's no image. */
  name?: string;
  size?: number;
}

export function Avatar({ src, alt, name = '', size = 36, className, ...props }: AvatarProps) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const loaded = !!src && loadedSrc === src;
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
  return (
    <span
      {...props}
      role="img"
      aria-label={alt ?? name}
      className={cn(
        'relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-surface font-medium text-fg-muted select-none',
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.38, ...props.style }}
    >
      {/* Initials sit underneath; the photo fades in once it has loaded instead of popping. */}
      {(!src || !loaded) && initials}
      {src && (
        <img
          src={src}
          alt=""
          draggable={false}
          onLoad={() => setLoadedSrc(src)}
          className={cn('absolute inset-0 size-full object-cover transition-opacity duration-300 ease-out', loaded ? 'opacity-100' : 'opacity-0')}
        />
      )}
    </span>
  );
}

/* ── Card ─────────────────────────────────────────────────────────────── */

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Card({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      {...props}
      className={cn('rounded-[14px] border border-line-subtle bg-bg p-5 text-fg shadow-control', className)}
    />
  );
});

export function CardHeader({ title, description, action }: { title: ReactNode; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold leading-tight text-fg">{title}</h3>
        {description && <p className="text-sm text-fg-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/* ── Separator & Link ─────────────────────────────────────────────────── */

export function Separator({ className, ...props }: SeparatorProps & { className?: string }) {
  return (
    <RACSeparator
      {...props}
      className={cn(
        'shrink-0 bg-line-subtle',
        props.orientation === 'vertical' ? 'w-px self-stretch' : 'h-px w-full',
        className,
      )}
    />
  );
}

export function Link({ className, ...props }: LinkProps) {
  return (
    <RACLink
      {...props}
      className={composeTw(
        className,
        cn(
          'rounded-sm text-fg underline decoration-line-strong underline-offset-[3px] transition-[text-decoration-color] duration-150 ease-out hover:decoration-fg',
          focusRing,
        ),
      )}
    />
  );
}
