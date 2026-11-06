import type { ReactNode } from 'react';
import {
  Button as RACButton,
  ListBox,
  ListBoxItem as RACListBoxItem,
  Select as RACSelect,
  SelectValue,
  type ListBoxItemProps,
  type SelectProps as RACSelectProps,
} from 'react-aria-components';
import { cn, composeTw, focusRing } from '../lib/cn';
import { Description, FieldError, Label, inputSizes } from './Field';
import { CheckIcon, ChevronDownIcon } from './icons';
import { Popover } from './Popover';

export interface SelectProps<T extends object> extends Omit<RACSelectProps<T>, 'children'> {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: string;
  items?: Iterable<T>;
  children: ReactNode | ((item: T) => ReactNode);
  size?: keyof typeof inputSizes;
}

export function Select<T extends object>({
  label,
  description,
  errorMessage,
  children,
  items,
  size = 'md',
  className,
  ...props
}: SelectProps<T>) {
  return (
    <RACSelect {...props} className={composeTw(className, 'group flex flex-col gap-1.5')}>
      {label && <Label>{label}</Label>}
      <RACButton
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-control border border-line bg-surface px-3.5 text-left text-fg shadow-control',
          'transition-[border-color,background-color,transform] duration-150 ease-out hover:border-line-strong pressed:scale-[0.99]',
          'group-invalid:border-danger disabled:opacity-50',
          focusRing,
          inputSizes[size],
        )}
      >
        <SelectValue className="truncate data-[placeholder]:text-fg-subtle" />
        <ChevronDownIcon size={18} className="shrink-0 text-fg-muted transition-transform duration-200 ease-out group-open:rotate-180" />
      </RACButton>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover placement="bottom start">
        <ListBox items={items} className="max-h-72 overflow-auto p-1.5 outline-none">
          {children}
        </ListBox>
      </Popover>
    </RACSelect>
  );
}

export function SelectItem(props: ListBoxItemProps & { children?: ReactNode }) {
  const textValue = props.textValue ?? (typeof props.children === 'string' ? props.children : undefined);
  return (
    <RACListBoxItem
      {...props}
      textValue={textValue}
      className={composeTw(
        props.className,
        'group flex h-9 cursor-default items-center gap-2 rounded-control px-2.5 text-[15px] text-fg outline-none select-none focus:bg-surface-hover pressed:bg-surface-pressed disabled:opacity-40',
      )}
    >
      {({ isSelected }) => (
        <>
          <span className="flex-1 truncate">{props.children as ReactNode}</span>
          {isSelected && <CheckIcon size={14} />}
        </>
      )}
    </RACListBoxItem>
  );
}
