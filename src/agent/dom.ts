import { isValidElement, type ReactNode } from 'react';
import type { KrtsAgentItem } from './types';

/* DOM helpers for the agent bridge: names, visibility, sections, input. */

export const ATTR = {
  id: 'data-krts-agent',
  hidden: 'data-krts-agent-hidden',
  secret: 'data-krts-agent-secret',
  confirm: 'data-krts-agent-confirm',
  approval: 'data-krts-agent-approval',
} as const;

export const clean = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();

/** Lower-case, accent-free, punctuation-light text for matching. */
export const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[“”"'‘’…*:]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const idSet = (el: Element, attr: string) => new Set((el.getAttribute(attr) ?? '').split(/\s+/).filter(Boolean));

/** Visible text, skipping aria-hidden parts, icons and anything in `skip`. */
export function textOf(node: Node, skip?: Set<string>): string {
  if (node.nodeType === 3) return node.textContent ?? '';
  if (node.nodeType !== 1) return '';
  const el = node as Element;
  const tag = el.tagName.toLowerCase();
  if (tag === 'svg' || tag === 'script' || tag === 'style' || tag === 'template') return '';
  if (el.getAttribute('aria-hidden') === 'true' || el.hasAttribute('hidden')) return '';
  if (skip && el.id && skip.has(el.id)) return '';
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return '';
  let out = '';
  for (const child of Array.from(el.childNodes)) out += child.nodeType === 1 ? ` ${textOf(child, skip)} ` : textOf(child, skip);
  return out;
}

/** Name from `aria-label` / `aria-labelledby` only (never content). */
export function ariaName(el: Element): string {
  const label = clean(el.getAttribute('aria-label'));
  if (label) return label;
  const by = el.getAttribute('aria-labelledby');
  if (!by) return '';
  const skip = idSet(el, 'aria-describedby');
  return clean(
    by
      .split(/\s+/)
      .map((id) => {
        const n = el.ownerDocument.getElementById(id);
        return n ? textOf(n, skip) : '';
      })
      .join(' '),
  );
}

/** A close approximation of the accessible name. */
export function nameOf(el: Element | null | undefined): string {
  if (!el) return '';
  const aria = ariaName(el);
  if (aria) return aria;
  const skip = idSet(el, 'aria-describedby');
  const labels = (el as HTMLInputElement).labels;
  if (labels?.length) {
    const t = clean(Array.from(labels, (l) => textOf(l, skip)).join(' '));
    if (t) return t;
  }
  const title = clean(el.getAttribute('title'));
  if (title) return title;
  const own = clean(textOf(el, skip));
  if (own) return own;
  return clean(el.getAttribute('placeholder'));
}

/** Whether agents may see this element: not hidden by marks, ARIA, `hidden`, `inert` or CSS. */
export function isVisible(el: Element): boolean {
  if (!el.isConnected) return false;
  for (let n: Element | null = el; n; n = n.parentElement) {
    if (
      n.hasAttribute(ATTR.hidden) ||
      n.hasAttribute('hidden') ||
      n.hasAttribute('inert') ||
      n.getAttribute('aria-hidden') === 'true'
    )
      return false;
  }
  const check = (el as Element & { checkVisibility?: (o?: object) => boolean }).checkVisibility;
  if (typeof check === 'function') return check.call(el, { visibilityProperty: true });
  return true;
}

export const closestAttr = (el: Element, attr: string): string | null => el.closest(`[${attr}]`)?.getAttribute(attr) ?? null;

const SECTIONS =
  '[role=dialog],[role=alertdialog],[role=tabpanel],[role=region],[role=group],[role=radiogroup],[role=toolbar],[role=menu],[role=form],form,fieldset,section,dialog';

/** Name of the nearest named container: dialog, tab panel, group, fieldset, section… */
export function sectionOf(el: Element): string | undefined {
  for (let n = el.parentElement; n; n = n.parentElement) {
    if (!n.matches(SECTIONS)) continue;
    const name = n.tagName === 'FIELDSET' ? clean(n.querySelector('legend')?.textContent) : ariaName(n);
    if (name) return name;
  }
  return undefined;
}

export const slotText = (root: Element, slot: string) => {
  const n = root.querySelector(`[slot="${slot}"]`);
  return n ? clean(textOf(n)) || undefined : undefined;
};

/** Set an input's value the way typing does, so React and React Aria see it. */
export function setNativeValue(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  if (setter) setter.call(input, value);
  else input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

/** Resolves after the UI has had two frames to react (or 60ms in a background tab). */
export function settle(): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => requestAnimationFrame(finish));
    setTimeout(finish, 60);
  });
}

export async function waitFor(check: () => boolean, timeout = 1000): Promise<boolean> {
  const end = Date.now() + timeout;
  while (!check()) {
    if (Date.now() > end) return false;
    await new Promise((r) => setTimeout(r, 16));
  }
  return true;
}

/** Plain text from a React node (for tooltip and toast content). */
export function nodeText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return clean(node.map(nodeText).join(' '));
  if (isValidElement(node)) return nodeText((node.props as { children?: ReactNode }).children);
  return '';
}

/** A thrown error whose message is meant for the agent. */
export class AgentError extends Error {}

const describeItems = (items: KrtsAgentItem[]) => {
  const names = items.slice(0, 12).map((i) => `“${i.label}”`);
  return names.join(', ') + (items.length > 12 ? `, … (${items.length - 12} more)` : '');
};

/** Find a choice by value, then label (exact, then whole word). Throws an AgentError listing options. */
export function pickItem<T extends KrtsAgentItem>(items: T[], wanted: unknown): T {
  if (typeof wanted !== 'string' && typeof wanted !== 'number') {
    throw new AgentError(`Expected an item label or value, got ${JSON.stringify(wanted)}. Options: ${describeItems(items)}.`);
  }
  const raw = String(wanted);
  const byValue = items.find((i) => i.value === raw);
  if (byValue) return byValue;
  const n = norm(raw);
  const exact = items.filter((i) => norm(i.label) === n || norm(i.value) === n);
  if (exact.length === 1) return exact[0]!;
  const partial = exact.length ? exact : items.filter((i) => wholeWord(norm(i.label), n));
  if (partial.length === 1) return partial[0]!;
  if (partial.length > 1) throw new AgentError(`“${raw}” matches ${partial.length} options: ${describeItems(partial)}. Use the exact label or value.`);
  throw new AgentError(`No option “${raw}”. Options: ${describeItems(items)}.`);
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const wholeWord = (hay: string, needle: string) =>
  !!needle && new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRe(needle)}($|[^\\p{L}\\p{N}])`, 'u').test(hay);

export function toBool(v: unknown, what = 'value'): boolean {
  if (typeof v === 'boolean') return v;
  if (v === 'true' || v === 'on' || v === 1) return true;
  if (v === 'false' || v === 'off' || v === 0) return false;
  throw new AgentError(`Expected true or false for ${what}, got ${JSON.stringify(v)}.`);
}

export function toNumber(v: unknown, what = 'value'): number {
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : v;
  if (typeof n !== 'number' || !Number.isFinite(n)) throw new AgentError(`Expected a number for ${what}, got ${JSON.stringify(v)}.`);
  return n;
}

export function toText(v: unknown): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  throw new AgentError(`Expected text, got ${JSON.stringify(v)}.`);
}
