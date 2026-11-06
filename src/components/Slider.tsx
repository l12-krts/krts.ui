import type { ReactNode } from 'react';
import {
  Slider as RACSlider,
  SliderOutput,
  SliderThumb,
  SliderTrack,
  type SliderProps as RACSliderProps,
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
      <SliderTrack className="relative h-7 w-full">
        {({ state }) => {
          const pcts = state.values.map((_, i) => state.getThumbPercent(i) * 100);
          const start = pcts.length > 1 ? pcts[0]! : 0;
          const end = pcts.length > 1 ? pcts[pcts.length - 1]! : pcts[0]!;
          return (
            <>
              <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-surface shadow-hairline" />
              {showFill && (
                <div
                  className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-primary"
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
                    'shadow-[0_0_1px_rgb(0_0_0/0.35),0_1px_3px_rgb(0_0_0/0.15)]',
                    'transition-[transform,box-shadow] duration-150 ease-out',
                    'dragging:scale-110 motion-reduce:dragging:scale-100',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
                  )}
                />
              ))}
            </>
          );
        }}
      </SliderTrack>
    </RACSlider>
  );
}
