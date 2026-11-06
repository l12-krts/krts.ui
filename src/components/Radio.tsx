import type { ReactNode } from 'react';
import {
  Radio as RACRadio,
  RadioGroup as RACRadioGroup,
  type RadioGroupProps as RACRadioGroupProps,
  type RadioProps,
} from 'react-aria-components';
import { cn, composeTw } from '../lib/cn';
import { Description, FieldError, Label } from './Field';

export interface RadioGroupProps extends Omit<RACRadioGroupProps, 'children'> {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: string;
  children?: ReactNode;
}

export function RadioGroup({ label, description, errorMessage, children, className, ...props }: RadioGroupProps) {
  return (
    <RACRadioGroup
      {...props}
      className={composeTw(className, 'group flex flex-col gap-2.5')}
    >
      {label && <Label>{label}</Label>}
      <div className="flex gap-x-5 gap-y-2.5 group-orientation-vertical:flex-col group-orientation-horizontal:flex-wrap">
        {children}
      </div>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </RACRadioGroup>
  );
}

export function Radio({ children, className, ...props }: RadioProps) {
  return (
    <RACRadio
      {...props}
      className={composeTw(
        className,
        'group flex items-center gap-2.5 text-base text-fg select-none disabled:opacity-50 [-webkit-tap-highlight-color:transparent]',
      )}
    >
      {(rp) => (
        <>
          <span
            className={cn(
              'relative grid size-6 shrink-0 place-items-center rounded-full border shadow-control',
              'transition-[background-color,border-color,transform] duration-150 ease-out',
              'group-pressed:scale-[0.92] motion-reduce:group-pressed:scale-100',
              'group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-focus',
              rp.isSelected
                ? 'border-primary-line bg-primary group-hover:bg-primary-hover'
                : 'border-line bg-surface group-hover:border-line-strong',
            )}
          >
            {/* The dot grows from 0.5, never from 0. */}
            <span
              className={cn(
                'size-3 rounded-full bg-primary-fg shadow-hairline transition-[transform,opacity] duration-200 ease-out',
                rp.isSelected ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
              )}
            />
          </span>
          {typeof children === 'function' ? children(rp) : children}
        </>
      )}
    </RACRadio>
  );
}
