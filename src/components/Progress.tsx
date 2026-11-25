import type { ReactNode } from 'react';
import {
  Meter as RACMeter,
  ProgressBar as RACProgressBar,
  type MeterProps as RACMeterProps,
  type ProgressBarProps as RACProgressBarProps,
} from 'react-aria-components';
import { cn, composeTw } from '../lib/cn';
import { Label } from './Field';
import { useProgressAgent } from '../agent/specs';
import type { KrtsAgentProps } from '../agent/types';

export interface ProgressBarProps extends RACProgressBarProps, KrtsAgentProps {
  label?: ReactNode;
  showValue?: boolean;
}

/** Progress uses linear motion: it's a constant process, not a gesture. */
export function ProgressBar({ label, showValue = !!label, className, agent, ...props }: ProgressBarProps) {
  const agentProps = useProgressAgent(agent, 'progressbar');
  return (
    <RACProgressBar {...props} {...agentProps} className={composeTw(className, 'flex w-full flex-col gap-2')}>
      {({ percentage, valueText, isIndeterminate }) => (
        <>
          {(label || showValue) && (
            <div className="flex justify-between gap-4">
              {label && <Label>{label}</Label>}
              {showValue && !isIndeterminate && <span className="text-sm tabular-nums text-fg-muted">{valueText}</span>}
            </div>
          )}
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface shadow-hairline">
            {isIndeterminate ? (
              <div className="absolute inset-y-0 left-0 w-full origin-left animate-krts-indeterminate rounded-full bg-primary" />
            ) : (
              <div
                className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-primary transition-transform duration-300 ease-linear"
                style={{ transform: `scaleX(${(percentage ?? 0) / 100})` }}
              />
            )}
          </div>
        </>
      )}
    </RACProgressBar>
  );
}

export interface MeterProps extends RACMeterProps, KrtsAgentProps {
  label?: ReactNode;
  /** Colour the fill by thresholds (fractions of the range). */
  thresholds?: { warning: number; danger: number };
}

export function Meter({ label, thresholds = { warning: 0.7, danger: 0.9 }, className, agent, ...props }: MeterProps) {
  const agentProps = useProgressAgent(agent, 'meter');
  return (
    <RACMeter {...props} {...agentProps} className={composeTw(className, 'flex w-full flex-col gap-2')}>
      {({ percentage, valueText }) => {
        const f = percentage / 100;
        const tone = f >= thresholds.danger ? 'bg-danger' : f >= thresholds.warning ? 'bg-warning' : 'bg-success';
        return (
          <>
            <div className="flex justify-between gap-4">
              {label && <Label>{label}</Label>}
              <span className="text-sm tabular-nums text-fg-muted">{valueText}</span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface shadow-hairline">
              <div
                className={cn('absolute inset-y-0 left-0 w-full origin-left rounded-full transition-[transform,background-color] duration-300 ease-out', tone)}
                style={{ transform: `scaleX(${f})` }}
              />
            </div>
          </>
        );
      }}
    </RACMeter>
  );
}
