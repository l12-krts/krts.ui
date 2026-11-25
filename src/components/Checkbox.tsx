import type { ReactNode } from 'react';
import {
  Checkbox as RACCheckbox,
  CheckboxGroup as RACCheckboxGroup,
  type CheckboxGroupProps as RACCheckboxGroupProps,
  type CheckboxProps as RACCheckboxProps,
} from 'react-aria-components';
import { cn, composeTw } from '../lib/cn';
import { Description, FieldError, Label } from './Field';
import { agentDomProps, useKrtsAgentId } from '../agent/registry';
import { CheckboxGroupAgent, useCheckboxAgent } from '../agent/specs';
import type { KrtsAgentProps } from '../agent/types';

export interface CheckboxProps extends Omit<RACCheckboxProps, 'children'>, KrtsAgentProps {
  children?: ReactNode;
}

/** 24px box from the Figma file; the check draws itself in on select. */
export function Checkbox({ children, className, agent, ...props }: CheckboxProps) {
  const agentProps = useCheckboxAgent(agent);
  return (
    <RACCheckbox
      {...props}
      {...agentProps}
      className={composeTw(
        className,
        'group flex items-center gap-2.5 text-base text-fg select-none disabled:opacity-50 [-webkit-tap-highlight-color:transparent]',
      )}
    >
      {({ isSelected, isIndeterminate }) => (
        <>
          <span
            className={cn(
              'grid size-6 shrink-0 place-items-center rounded-[7px] border shadow-control',
              'transition-[background-color,border-color] duration-150 ease-out',
              'group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-focus',
              isSelected || isIndeterminate
                ? 'border-primary-line bg-primary text-primary-fg group-hover:bg-primary-hover'
                : 'border-line bg-surface group-hover:border-line-strong',
              'group-invalid:border-danger',
            )}
          >
            <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {isIndeterminate ? (
                <path d="M4 8h8" />
              ) : (
                <path
                  d="M3.5 8.5 6.5 11.5 12.5 4.5"
                  pathLength={1}
                  className="transition-[stroke-dashoffset] duration-200 ease-out [stroke-dasharray:1]"
                  style={{ strokeDashoffset: isSelected ? 0 : 1 }}
                />
              )}
            </svg>
          </span>
          {children}
        </>
      )}
    </RACCheckbox>
  );
}

export interface CheckboxGroupProps extends Omit<RACCheckboxGroupProps, 'children'>, KrtsAgentProps {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: string;
  children?: ReactNode;
}

export function CheckboxGroup({ label, description, errorMessage, children, className, agent, ...props }: CheckboxGroupProps) {
  const agentId = useKrtsAgentId();
  return (
    <RACCheckboxGroup {...props} {...agentDomProps(agent, agentId)} className={composeTw(className, 'flex flex-col gap-2.5')}>
      {label && <Label>{label}</Label>}
      {children}
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <CheckboxGroupAgent id={agentId} mark={agent} />
    </RACCheckboxGroup>
  );
}
