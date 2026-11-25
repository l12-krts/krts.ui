import { createContext, useEffect, useId, useRef } from 'react';
import { ATTR, closestAttr, clean, isVisible, nameOf, sectionOf } from './dom';
import type { KrtsAgentApprovalRequest, KrtsAgentComponent, KrtsAgentEvent, KrtsAgentItem, KrtsAgentMark } from './types';

/* ── specs ────────────────────────────────────────────────────────────── */

export interface KrtsAgentAction {
  /** Do it. Throw an `Error` with a message for the agent if it can't be done. */
  run: (args: unknown[], el: Element) => void | Promise<void>;
  /** Checked after the UI settles. Return a message if the change didn't take. */
  verify?: (args: unknown[], el: Element) => string | undefined;
  /** Opening, closing and dismissing don't change data, so they never need a person's OK. */
  safe?: boolean;
}

export type KrtsAgentActions = Record<string, KrtsAgentAction | false | null | undefined>;

/**
 * How a component describes itself to agents. Every function reads the
 * latest render, so it is safe to close over props and state.
 */
export interface KrtsAgentComponentSpec {
  /** Kind, e.g. `"rating"`. */
  component: string;
  /** The `agent` prop, if the component takes one. */
  mark?: KrtsAgentMark;
  /** Defaults to the element's accessible name. */
  label?: (el: Element) => string | undefined;
  description?: (el: Element) => string | undefined;
  /** Current state, e.g. `{ value: 3 }`. Keys become top-level snapshot fields. */
  state?: (el: Element) => Record<string, unknown>;
  /** Choices, for selects, tabs, radio groups… */
  items?: (el: Element) => KrtsAgentItem[] | undefined;
  /** Falsy entries are left out, so `{ submit: canSubmit && {…} }` works. */
  actions?: KrtsAgentActions | ((el: Element) => KrtsAgentActions);
  /** Defaults to the element's `disabled` / `data-disabled` / `aria-disabled`. */
  disabled?: (el: Element) => boolean;
  /** Always needs a person's OK for non-safe actions; the text says why. */
  confirm?: string;
  /** Dialogs, menus and open popups: listed first. */
  overlay?: boolean | ((el: Element) => boolean);
  /** The value is a secret by default (password fields…). */
  secret?: (el: Element) => boolean;
  /** Tooltip text. */
  hint?: string;
}

export interface AgentEntry {
  ref: string;
  domId: string;
  getSpec: () => KrtsAgentComponentSpec | null;
  el: Element | null;
  /** Last state the change scanner saw (only while someone subscribes). */
  last?: Record<string, unknown>;
  seen?: { label: string; component: string };
}

type Approver = (req: KrtsAgentApprovalRequest, ctx: { signal: AbortSignal }) => boolean | Promise<boolean>;

interface Store {
  entries: Map<string, AgentEntry>;
  counter: number;
  listeners: Set<(e: KrtsAgentEvent) => void>;
  /** Refs an agent step is changing right now. */
  touched: Set<string>;
  acting: number;
  approvers: Approver[];
  scanQueued: boolean;
  /** The next scan records a baseline instead of reporting changes. */
  baselinePending?: boolean;
  detachDom?: () => void;
}

// One store per page, even if two copies of krts.ui get bundled.
const KEY = Symbol.for('krts.ui/agent');
const g = globalThis as typeof globalThis & { [KEY]?: Store };
export const store: Store = (g[KEY] ??= {
  entries: new Map(),
  counter: 0,
  listeners: new Set(),
  touched: new Set(),
  acting: 0,
  approvers: [],
  scanQueued: false,
});

/** True while an agent step is running, e.g. inside an `onChange` it caused. */
export function isKrtsAgentActing(): boolean {
  return store.acting > 0;
}

export function addApprover(fn: Approver): () => void {
  store.approvers.push(fn);
  return () => {
    const i = store.approvers.lastIndexOf(fn);
    if (i >= 0) store.approvers.splice(i, 1);
  };
}

/* ── registration ─────────────────────────────────────────────────────── */

/** A DOM-safe id for `data-krts-agent`. Stable across server and client renders. */
export function useKrtsAgentId(): string {
  return `k${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
}

/** Data attributes for a component root: its agent id plus any marks. */
export function agentDomProps(mark: KrtsAgentMark | undefined, id: string | undefined) {
  const confirm = mark?.confirm;
  return {
    [ATTR.id]: mark?.hidden ? undefined : id,
    [ATTR.hidden]: mark?.hidden ? '' : undefined,
    [ATTR.secret]: mark?.secret ? '' : undefined,
    [ATTR.confirm]: confirm ? (typeof confirm === 'string' ? confirm : '') : undefined,
  } as Record<string, string | undefined>;
}

/**
 * Registers a component with the agent bridge while it is mounted.
 * Spread the returned props onto its root element.
 *
 * Pass `id` when the spec is built in a child (to read React Aria state
 * from context) and the root is rendered by the parent.
 */
export function useKrtsAgentComponent(spec: KrtsAgentComponentSpec | null | false | undefined, id?: string) {
  const own = useKrtsAgentId();
  const domId = id ?? own;
  const latest = useRef<KrtsAgentComponentSpec | null>(null);
  latest.current = spec || null;
  const active = !!spec && !spec.mark?.hidden;

  useEffect(() => {
    if (!active) return;
    const entry: AgentEntry = { ref: `k${++store.counter}`, domId, getSpec: () => latest.current, el: null };
    store.entries.set(entry.ref, entry);
    scheduleScan();
    return () => {
      store.entries.delete(entry.ref);
      if (entry.seen) emit({ type: 'disappear', ref: entry.ref, ...entry.seen });
    };
  }, [domId, active]);

  // Re-renders are how most state changes show up.
  useEffect(() => {
    if (active) scheduleScan();
  });

  return agentDomProps(spec ? spec.mark : undefined, active ? domId : undefined);
}

export function elementOf(entry: AgentEntry): Element | null {
  if (entry.el?.isConnected && entry.el.getAttribute(ATTR.id) === entry.domId) return entry.el;
  if (typeof document === 'undefined') return null;
  entry.el = document.querySelector(`[${ATTR.id}="${entry.domId}"]`);
  return entry.el;
}

/** Tooltip text for the trigger inside `<WithTooltip>`. */
export const AgentHintContext = createContext<string | undefined>(undefined);

/* ── reading ──────────────────────────────────────────────────────────── */

export const REDACTED = '[redacted]';

export function isSecret(spec: KrtsAgentComponentSpec, el: Element) {
  return !!spec.mark?.secret || !!spec.secret?.(el) || !!el.closest(`[${ATTR.secret}]`);
}

export function readState(spec: KrtsAgentComponentSpec, el: Element): Record<string, unknown> {
  const raw = spec.state?.(el) ?? {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) if (v !== undefined) out[k] = v;
  if (isSecret(spec, el) && 'value' in out && out.value !== '' && out.value != null) out.value = REDACTED;
  return out;
}

export function isDisabled(spec: KrtsAgentComponentSpec, el: Element) {
  if (spec.disabled) return spec.disabled(el);
  return (
    el.hasAttribute('data-disabled') ||
    el.getAttribute('aria-disabled') === 'true' ||
    (el as HTMLButtonElement).disabled === true
  );
}

export function confirmOf(spec: KrtsAgentComponentSpec, el: Element): string | undefined {
  const fromDom = closestAttr(el, ATTR.confirm);
  if (fromDom !== null) return fromDom || 'A person must approve changes here.';
  return spec.confirm;
}

export function actionsOf(spec: KrtsAgentComponentSpec, el: Element): Record<string, KrtsAgentAction> {
  const all = typeof spec.actions === 'function' ? spec.actions(el) : (spec.actions ?? {});
  const out: Record<string, KrtsAgentAction> = {};
  for (const [name, action] of Object.entries(all)) if (action) out[name] = action;
  return out;
}

export const isOverlay = (spec: KrtsAgentComponentSpec, el: Element) =>
  typeof spec.overlay === 'function' ? spec.overlay(el) : !!spec.overlay;

export interface Described {
  entry: AgentEntry;
  spec: KrtsAgentComponentSpec;
  el: Element;
  info: KrtsAgentComponent;
}

/** One entry as the agent sees it, or null if it isn't on screen. */
export function describe(entry: AgentEntry, itemLimit = 20, from = 0): Described | null {
  const spec = entry.getSpec();
  if (!spec) return null;
  const el = elementOf(entry);
  if (!el || !isVisible(el)) return null;
  const label = clean(spec.mark?.label) || clean(spec.label?.(el)) || nameOf(el);
  const info: KrtsAgentComponent = { ref: entry.ref, component: spec.component, label, actions: [] };
  const description = clean(spec.mark?.description) || clean(spec.description?.(el));
  if (description) info.description = description;
  if (spec.hint && spec.hint !== label) info.hint = spec.hint;
  const section = sectionOf(el);
  if (section && section !== label) info.section = section;
  Object.assign(info, readState(spec, el));
  const items = spec.items?.(el);
  if (items) {
    info.items = items.slice(from, from + itemLimit);
    if (items.length > from + itemLimit) info.more = items.length - from - itemLimit;
  }
  const disabled = isDisabled(spec, el);
  if (disabled) info.disabled = true;
  const confirm = confirmOf(spec, el);
  if (confirm !== undefined) info.confirm = confirm;
  // `actions` last, so it reads naturally in JSON.
  delete (info as Partial<KrtsAgentComponent>).actions;
  info.actions = disabled ? [] : Object.keys(actionsOf(spec, el));
  return { entry, spec, el, info };
}

/** Everything on screen: open dialogs and menus first, then page order. */
export function describeAll(itemLimit = 20): Described[] {
  const list: Described[] = [];
  for (const entry of store.entries.values()) {
    const d = describe(entry, itemLimit);
    if (d) list.push(d);
  }
  const rank = (d: Described) => (isOverlay(d.spec, d.el) ? 0 : d.el.closest('[role=dialog],[role=alertdialog],[role=menu],[data-trigger]') ? 1 : 2);
  return list.sort((a, b) => {
    const r = rank(a) - rank(b);
    if (r) return r;
    return a.el.compareDocumentPosition(b.el) & 4 /* FOLLOWING */ ? -1 : 1;
  });
}

/* ── change events ────────────────────────────────────────────────────── */

function emit(event: KrtsAgentEvent) {
  for (const l of [...store.listeners]) {
    try {
      l(event);
    } catch (err) {
      console.error(err);
    }
  }
}

export function scheduleScan() {
  if (!store.listeners.size || store.scanQueued) return;
  store.scanQueued = true;
  const run = () => {
    if (!store.scanQueued) return;
    store.scanQueued = false;
    scan();
  };
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(run);
  setTimeout(run, 50);
}

/** Compare every component with what we saw last time and emit the differences. */
export function scan() {
  if (!store.listeners.size) return;
  if (store.baselinePending) {
    // First scan after someone subscribed: record, don't report. Taken after
    // the UI settles so e.g. a Select whose options load a render later
    // doesn't look like it changed.
    store.baselinePending = false;
    for (const entry of store.entries.values()) {
      const d = describe(entry, 0);
      entry.seen = d ? { component: d.info.component, label: d.info.label } : undefined;
      entry.last = d ? readState(d.spec, d.el) : undefined;
    }
    return;
  }
  for (const entry of store.entries.values()) {
    const d = describe(entry, 0);
    if (!d) {
      if (entry.seen) {
        emit({ type: 'disappear', ref: entry.ref, ...entry.seen });
        entry.seen = undefined;
        entry.last = undefined;
      }
      continue;
    }
    const { component, label } = d.info;
    const state = readState(d.spec, d.el);
    if (!entry.seen) {
      entry.seen = { component, label };
      entry.last = state;
      emit({ type: 'appear', ref: entry.ref, component, label });
      continue;
    }
    entry.seen = { component, label };
    const prev = entry.last ?? {};
    entry.last = state;
    const source = store.touched.has(entry.ref) ? 'agent' : 'user';
    for (const key of new Set([...Object.keys(prev), ...Object.keys(state)])) {
      if (JSON.stringify(prev[key]) === JSON.stringify(state[key])) continue;
      emit({ type: 'change', ref: entry.ref, component, label, key, value: state[key], previous: prev[key], source });
    }
  }
}

const DOM_EVENTS = ['input', 'change', 'click', 'keyup', 'pointerup'] as const;

export function subscribe(listener: (e: KrtsAgentEvent) => void): () => void {
  store.listeners.add(listener);
  if (store.listeners.size === 1 && typeof document !== 'undefined') {
    // Listeners only hear about what happens next.
    store.baselinePending = true;
    scheduleScan();
    // Uncontrolled fields change without re-rendering krts components.
    const onDom = () => scheduleScan();
    for (const t of DOM_EVENTS) document.addEventListener(t, onDom, true);
    store.detachDom = () => DOM_EVENTS.forEach((t) => document.removeEventListener(t, onDom, true));
  }
  return () => {
    store.listeners.delete(listener);
    if (!store.listeners.size) {
      store.detachDom?.();
      store.detachDom = undefined;
    }
  };
}
