import { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/cn';
import { Button, type ButtonProps } from './Button';
import { CheckIcon, CopyIcon } from './icons';

export interface CopyButtonProps extends Omit<ButtonProps, 'onPress' | 'children' | 'value'> {
  /** Text to copy (or a function returning it). */
  value: string | (() => string);
  label?: string;
  copiedLabel?: string;
  onCopy?: (value: string) => void;
}

/**
 * Copies to the clipboard and morphs its icon. The swap is a crossfade
 * with a touch of blur so it reads as one object changing, not two
 * objects swapping. Says "copied" immediately — the clipboard write is
 * effectively instant and rarely fails.
 */
export function CopyButton({ value, label = 'Copy', copiedLabel = 'Copied', onCopy, isIconOnly = true, size = 'sm', variant = 'secondary', ...props }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(t.current), []);

  const icon = (
    <span className="relative grid size-4 place-items-center">
      <CopyIcon
        size={16}
        className={cn('absolute transition-[opacity,filter,transform] duration-200 ease-out', copied ? 'scale-75 opacity-0 blur-[2px]' : 'opacity-100')}
      />
      <CheckIcon
        size={16}
        className={cn('absolute transition-[opacity,filter,transform] duration-200 ease-out', copied ? 'opacity-100' : 'scale-75 opacity-0 blur-[2px]')}
      />
    </span>
  );

  return (
    <Button
      {...props}
      size={size}
      variant={variant}
      isIconOnly={isIconOnly}
      aria-label={isIconOnly ? (copied ? copiedLabel : label) : undefined}
      onPress={() => {
        const text = typeof value === 'function' ? value() : value;
        void navigator.clipboard?.writeText(text).catch(() => setCopied(false));
        setCopied(true);
        onCopy?.(text);
        clearTimeout(t.current);
        t.current = setTimeout(() => setCopied(false), 1600);
      }}
    >
      {icon}
      {!isIconOnly && <span>{copied ? copiedLabel : label}</span>}
      <span role="status" className="sr-only">
        {copied ? copiedLabel : ''}
      </span>
    </Button>
  );
}
