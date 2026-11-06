import { cn } from '../lib/cn';

export interface SpinnerProps {
  size?: number;
  className?: string;
  /** Accessible label. Omit when the spinner is decorative (e.g. inside a pending button). */
  label?: string;
}

/**
 * A fast spinner (600ms/turn). A faster spinner makes the same wait
 * *feel* shorter.
 */
export function Spinner({ size = 16, className, label }: SpinnerProps) {
  return (
    <span
      role={label ? 'progressbar' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        'inline-block shrink-0 animate-krts-spin rounded-full border-2 border-current border-r-transparent opacity-80',
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
}
