import { forwardRef, type ReactNode } from 'react';
import {
  FieldError as RACFieldError,
  Input as RACInput,
  Label as RACLabel,
  NumberField as RACNumberField,
  SearchField as RACSearchField,
  Text,
  TextArea as RACTextArea,
  TextField as RACTextField,
  Group,
  Button as RACButton,
  type FieldErrorProps,
  type InputProps,
  type LabelProps,
  type NumberFieldProps as RACNumberFieldProps,
  type SearchFieldProps as RACSearchFieldProps,
  type TextFieldProps as RACTextFieldProps,
  type TextProps,
  type ValidationResult,
} from 'react-aria-components';
import { cn, composeTw } from '../lib/cn';
import { MinusIcon, PlusIcon, SearchIcon, XIcon } from './icons';

export function Label(props: LabelProps) {
  return <RACLabel {...props} className={cn('text-sm font-medium text-fg select-none', props.className)} />;
}

export function Description(props: TextProps) {
  return <Text {...props} slot="description" className={cn('text-[13px] text-fg-muted', props.className)} />;
}

export function FieldError(props: FieldErrorProps) {
  return (
    <RACFieldError
      {...props}
      className={composeTw(
        props.className,
        // Errors appear mid-form; ease them in so the layout change isn't jarring.
        'text-[13px] text-danger transition-[opacity,translate] duration-200 ease-out starting:-translate-y-1 starting:opacity-0 motion-reduce:starting:translate-y-0',
      )}
    />
  );
}

/** Shared look for text-like controls (from the Figma "Input Field"). */
export const inputFrame = cn(
  'flex w-full items-center rounded-control border bg-surface text-fg shadow-control',
  'border-line transition-[border-color,box-shadow,background-color] duration-150 ease-out',
  'hover:border-line-strong',
  'focus-within:border-line-strong focus-within:ring-2 focus-within:ring-focus/15',
  'has-[[data-invalid]]:border-danger has-[[aria-invalid=true]]:border-danger',
  'has-[[data-disabled]]:opacity-50 has-[[data-disabled]]:cursor-not-allowed',
);

export const inputSizes = { sm: 'h-9 text-sm', md: 'h-12 text-base' } as const;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  return (
    <RACInput
      ref={ref}
      {...props}
      className={composeTw(
        props.className,
        'min-w-0 flex-1 bg-transparent px-3.5 font-sans text-fg outline-none placeholder:text-fg-subtle disabled:cursor-not-allowed [&::-webkit-search-cancel-button]:hidden',
      )}
    />
  );
});

interface FieldChrome {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: string | ((v: ValidationResult) => string);
  size?: keyof typeof inputSizes;
}

export interface TextFieldProps extends RACTextFieldProps, FieldChrome {
  placeholder?: string;
  /** Rendered inside the field, before the input. */
  startContent?: ReactNode;
  endContent?: ReactNode;
}

export function TextField({
  label,
  description,
  errorMessage,
  placeholder,
  size = 'md',
  startContent,
  endContent,
  className,
  ...props
}: TextFieldProps) {
  return (
    <RACTextField {...props} className={composeTw(className, 'group flex flex-col gap-1.5')}>
      {label && <Label>{label}</Label>}
      <div className={cn(inputFrame, inputSizes[size])}>
        {startContent && <span className="pl-3.5 text-fg-subtle [&+input]:pl-2">{startContent}</span>}
        <Input placeholder={placeholder} />
        {endContent && <span className="pr-3.5 text-fg-subtle">{endContent}</span>}
      </div>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </RACTextField>
  );
}

export interface TextAreaFieldProps extends RACTextFieldProps, Omit<FieldChrome, 'size'> {
  placeholder?: string;
  rows?: number;
}

export function TextAreaField({ label, description, errorMessage, placeholder, rows = 4, className, ...props }: TextAreaFieldProps) {
  return (
    <RACTextField {...props} className={composeTw(className, 'group flex flex-col gap-1.5')}>
      {label && <Label>{label}</Label>}
      <div className={cn(inputFrame, 'items-stretch')}>
        <RACTextArea
          rows={rows}
          placeholder={placeholder}
          className="min-h-0 w-full resize-y bg-transparent px-3.5 py-3 font-sans text-base text-fg outline-none placeholder:text-fg-subtle"
        />
      </div>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </RACTextField>
  );
}

export interface SearchFieldProps extends RACSearchFieldProps, FieldChrome {
  placeholder?: string;
}

export function SearchField({ label, description, errorMessage, placeholder = 'Search…', size = 'md', className, ...props }: SearchFieldProps) {
  return (
    <RACSearchField {...props} className={composeTw(className, 'group flex flex-col gap-1.5')}>
      {label && <Label>{label}</Label>}
      <div className={cn(inputFrame, inputSizes[size])}>
        <SearchIcon className="ml-3.5 shrink-0 text-fg-subtle" />
        <Input placeholder={placeholder} className="pl-2" />
        <RACButton
          className={cn(
            'mr-2 grid size-7 place-items-center rounded-md text-fg-subtle outline-none',
            'transition-[opacity,background-color] duration-150 ease-out hover:bg-surface-hover pressed:bg-surface-pressed',
            'focus-visible:ring-2 focus-visible:ring-focus/40 group-data-[empty]:pointer-events-none group-data-[empty]:opacity-0',
          )}
        >
          <XIcon size={14} />
        </RACButton>
      </div>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </RACSearchField>
  );
}

export interface NumberFieldProps extends RACNumberFieldProps, FieldChrome {
  placeholder?: string;
}

const stepper = cn(
  'grid h-full w-10 shrink-0 place-items-center text-fg-muted outline-none',
  'transition-[background-color,color] duration-150 ease-out hover:bg-surface-hover hover:text-fg pressed:bg-surface-pressed',
  'disabled:opacity-40 focus-visible:bg-surface-hover',
);

export function NumberField({ label, description, errorMessage, placeholder, size = 'md', className, ...props }: NumberFieldProps) {
  return (
    <RACNumberField {...props} className={composeTw(className, 'group flex flex-col gap-1.5')}>
      {label && <Label>{label}</Label>}
      <Group className={cn(inputFrame, inputSizes[size], 'overflow-hidden')}>
        <RACButton slot="decrement" className={cn(stepper, 'border-r border-line')}>
          <MinusIcon size={14} />
        </RACButton>
        <Input placeholder={placeholder} className="text-center tabular-nums" />
        <RACButton slot="increment" className={cn(stepper, 'border-l border-line')}>
          <PlusIcon size={14} />
        </RACButton>
      </Group>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </RACNumberField>
  );
}

