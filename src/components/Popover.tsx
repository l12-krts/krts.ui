import { Popover as RACPopover, type PopoverProps as RACPopoverProps } from 'react-aria-components';
import { cn, composeTw } from '../lib/cn';
import { useKrtsConfig, type OverlayAnimation } from '../lib/config';

/** Shared floating-surface look (Figma "Dropdown menu": 12px radius). */
export const floatingSurface = cn(
  'rounded-menu border border-line-subtle bg-overlay text-fg shadow-float outline-none',
);

/**
 * Enter/exit motion for floating menus. Exits are quicker than entrances.
 *
 * - `fade`: a quick opacity fade (default — good for dashboards).
 * - `scale`: grows out of the trigger (`--trigger-anchor-point`), never from
 *   the centre and never from scale(0).
 * - `none`: instant.
 */
export const floatingMotion: Record<OverlayAnimation, string> = {
  fade: cn('transition-opacity duration-120 ease-out', 'entering:opacity-0 exiting:opacity-0 exiting:duration-100'),
  scale: cn(
    'origin-(--trigger-anchor-point) will-change-transform',
    'transition-[opacity,transform] duration-200 ease-out',
    'entering:opacity-0 entering:scale-[0.96]',
    'exiting:opacity-0 exiting:scale-[0.98] exiting:duration-120',
    'motion-reduce:entering:scale-100 motion-reduce:exiting:scale-100',
  ),
  none: '',
};

export interface PopoverProps extends RACPopoverProps {
  /** Defaults to `menuAnimation` from `<KrtsProvider>`, which defaults to `'fade'`. */
  animation?: OverlayAnimation;
}

export function Popover({ className, offset = 6, animation, ...props }: PopoverProps) {
  const { menuAnimation } = useKrtsConfig();
  return (
    <RACPopover
      offset={offset}
      {...props}
      data-animation={animation ?? menuAnimation}
      className={composeTw(className, cn(floatingSurface, floatingMotion[animation ?? menuAnimation], 'min-w-(--trigger-width)'))}
    />
  );
}
