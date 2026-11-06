import { useLayoutEffect, useRef, type ReactNode } from 'react';
import {
  Slider as RACSlider,
  SliderOutput,
  SliderThumb,
  SliderTrack,
  type SliderProps as RACSliderProps,
  type SliderState,
} from 'react-aria-components';
import { cn, composeTw } from '../lib/cn';
import { Label } from './Field';

export interface SliderProps<T extends number | number[]> extends RACSliderProps<T> {
  label?: ReactNode;
  /** Show the current value next to the label. Default true when a label is given. */
  showValue?: boolean;
  /** Show the filled portion of the track (Figma "Slider Fill"). Default true. */
  showFill?: boolean;
  /** Accessible names for each thumb (range sliders). */
  thumbLabels?: string[];
}

export function Slider<T extends number | number[]>({
  label,
  showValue = !!label,
  showFill = true,
  thumbLabels,
  className,
  ...props
}: SliderProps<T>) {
  return (
    <RACSlider
      {...props}
      className={composeTw(className, 'group flex w-full flex-col gap-2 select-none disabled:opacity-50')}
    >
      {(label || showValue) && (
        <div className="flex items-center justify-between gap-4">
          {label && <Label>{label}</Label>}
          {showValue && (
            <SliderOutput className="text-sm tabular-nums text-fg-muted">
              {({ state }) => state.values.map((_, i) => state.getThumbValueLabel(i)).join(' – ')}
            </SliderOutput>
          )}
        </div>
      )}
      <SliderTrack className="group/track relative h-7 w-full touch-none">
        {({ state }) => <TrackContents state={state} showFill={showFill} thumbLabels={thumbLabels} />}
      </SliderTrack>
    </RACSlider>
  );
}

/**
 * Motion rules:
 * - While a thumb is being dragged it follows the pointer 1:1 (no lag).
 * - Jumps — clicking the track, keyboard steps, programmatic changes —
 *   glide there with a short ease-out instead of teleporting.
 */
function TrackContents({ state, showFill, thumbLabels }: { state: SliderState; showFill: boolean; thumbLabels?: string[] }) {
  const pcts = state.values.map((_, i) => state.getThumbPercent(i) * 100);
  const dragging = state.values.map((_, i) => state.isThumbDragging(i));

  // What was dragging at the last commit. The first frame of a drag that
  // starts with a track click is a jump, so it still animates.
  const wasDragging = useRef<boolean[]>(dragging);
  useLayoutEffect(() => {
    wasDragging.current = dragging;
  });
  const glide = dragging.map((d, i) => !d || !wasDragging.current[i]);
  const anyTracking = dragging.some((d, i) => d && !glide[i]);

  const start = pcts.length > 1 ? pcts[0]! : 0;
  const end = pcts.length > 1 ? pcts[pcts.length - 1]! : pcts[0]!;

  return (
    <>
      <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-surface shadow-hairline" />
      {showFill && (
        <div
          className={cn(
            'absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-primary',
            !anyTracking && 'transition-[left,width] duration-200 ease-out motion-reduce:transition-none',
          )}
          style={{ left: `${start}%`, width: `${end - start}%` }}
        />
      )}
      {state.values.map((_, i) => (
        <SliderThumb
          key={i}
          index={i}
          aria-label={thumbLabels?.[i]}
          className={cn(
            'top-1/2 size-7 rounded-full border border-surface bg-white',
            'shadow-[0_0_1px_rgb(0_0_0/0.35),0_1px_3px_rgb(0_0_0/0.15),0_0_0_0_rgb(0_0_0/0)]',
            // Halo instead of scaling: grows on hover, stronger while dragging.
            'hover:shadow-[0_0_1px_rgb(0_0_0/0.35),0_1px_3px_rgb(0_0_0/0.15),0_0_0_5px_rgb(0_0_0/0.06)]',
            'dragging:shadow-[0_0_1px_rgb(0_0_0/0.35),0_1px_3px_rgb(0_0_0/0.15),0_0_0_7px_rgb(0_0_0/0.08)]',
            'dark:hover:shadow-[0_0_1px_rgb(0_0_0/0.35),0_1px_3px_rgb(0_0_0/0.15),0_0_0_5px_rgb(255_255_255/0.1)]',
            'dark:dragging:shadow-[0_0_1px_rgb(0_0_0/0.35),0_1px_3px_rgb(0_0_0/0.15),0_0_0_7px_rgb(255_255_255/0.14)]',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
            glide[i]
              ? 'transition-[left,box-shadow] duration-200 ease-out motion-reduce:transition-[box-shadow]'
              : 'transition-[box-shadow] duration-200 ease-out',
          )}
        />
      ))}
    </>
  );
}
