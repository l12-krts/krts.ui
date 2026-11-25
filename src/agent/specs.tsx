import { useContext, useRef } from 'react';
import {
  CheckboxGroupStateContext,
  DisclosureStateContext,
  NumberFieldStateContext,
  RadioGroupStateContext,
  SelectStateContext,
  SliderStateContext,
  TabListStateContext,
  ToggleGroupStateContext,
} from 'react-aria-components';
import type { Key } from 'react-aria-components';
import { dispatchKrtsEvent, KRTS_EVENTS } from '../lib/dom-events';
import type { GestureOptions, SwipeDirection } from '../hooks/useGesture';
import {
  AgentError,
  clean,
  nameOf,
  pickItem,
  setNativeValue,
  settle,
  slotText,
  textOf,
  toBool,
  toNumber,
  toText,
  waitFor,
} from './dom';
import { useKrtsAgentComponent, type KrtsAgentAction, type KrtsAgentComponentSpec } from './registry';
import type { KrtsAgentItem, KrtsAgentMark } from './types';

/*
 * How each krts component describes itself to agents.
 *
 * Probes (`<XAgent id mark />`) render nothing; they sit inside a React Aria
 * component so they can read its state from context and call its setters.
 * Components without useful state context use the DOM the same way a person
 * would (clicks and input events), which still runs every React Aria handler.
 */

export interface ProbeProps {
  /** The `data-krts-agent` id the parent put on its root. */
  id: string;
  mark?: KrtsAgentMark;
}

const useLatest = <T,>(value: T) => {
  const ref = useRef(value);
  ref.current = value;
  return ref;
};

const press = (el: Element) => (el as HTMLElement).click();

/* ── choices read from the DOM ────────────────────────────────────────── */

interface Choice {
  el: HTMLElement;
  item: KrtsAgentItem;
}

function choices(root: Element, selector: string, read: (el: HTMLElement) => Partial<KrtsAgentItem> = () => ({})): Choice[] {
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).map((el) => {
    const label = nameOf(el);
    const extra = read(el);
    const item: KrtsAgentItem = { value: extra.value ?? label, label };
    if (extra.selected) item.selected = true;
    if (extra.disabled) item.disabled = true;
    return { el, item };
  });
}

const ariaOn = (el: Element, attr: string) => el.getAttribute(attr) === 'true';

const inputChoice = (el: HTMLElement) => {
  const input = el as HTMLInputElement;
  return { value: input.value, selected: input.checked, disabled: input.disabled };
};

function pickChoice(list: Choice[], wanted: unknown): Choice {
  const item = pickItem(
    list.map((c) => c.item),
    wanted,
  );
  const found = list.find((c) => c.item === item)!;
  if (item.disabled) throw new AgentError(`“${item.label}” is disabled.`);
  return found;
}

const selectedLabels = (items: KrtsAgentItem[]) => items.filter((i) => i.selected).map((i) => i.label);

/* ── buttons and gestures ─────────────────────────────────────────────── */

type GestureHandlers = Pick<GestureOptions, 'onSingleTap' | 'onDoubleTap' | 'onMultiTap' | 'onHoldStart' | 'onHold' | 'onHoldEnd' | 'onSwipe' | 'maxTaps' | 'holdDuration' | 'dispatchDomEvents'>;

const DIRECTIONS: SwipeDirection[] = ['left', 'right', 'up', 'down'];

/**
 * Gesture actions for the handlers that are attached. A gesture can't be
 * performed by an agent, so the handler is called with a `virtual` event,
 * as for a screen reader.
 */
export function gestureActions(g: { current: GestureHandlers }): Record<string, KrtsAgentAction | undefined> {
  const o = g.current;
  const dom = (el: Element, name: (typeof KRTS_EVENTS)[keyof typeof KRTS_EVENTS], detail: object) => {
    if (g.current.dispatchDomEvents !== false) dispatchKrtsEvent(el, name, detail);
  };
  const tap = (type: 'singletap' | 'doubletap' | 'multitap', count: number, el: Element) => ({ type, count, pointerType: 'virtual' as const, target: el });
  const hold = (type: 'holdstart' | 'hold' | 'holdend', el: Element) => {
    const duration = type === 'holdstart' ? 0 : (g.current.holdDuration ?? 500);
    return { type, duration, seconds: Math.floor(duration / 1000), progress: type === 'holdstart' ? 0 : 1, pointerType: 'virtual' as const, target: el };
  };
  return {
    singleTap: o.onSingleTap && {
      run: (_, el) => {
        const e = tap('singletap', 1, el);
        g.current.onSingleTap?.(e);
        dom(el, KRTS_EVENTS.singleTap, e);
      },
    },
    doubleTap: o.onDoubleTap && {
      run: (_, el) => {
        const e = tap('doubletap', 2, el);
        g.current.onDoubleTap?.(e);
        dom(el, KRTS_EVENTS.doubleTap, e);
      },
    },
    multiTap: o.onMultiTap && {
      run: ([count = 1], el) => {
        const n = Math.round(toNumber(count, 'count'));
        const max = g.current.maxTaps ?? 3;
        if (n < 1 || n > max) throw new AgentError(`count must be between 1 and ${max}.`);
        const e = tap('multitap', n, el);
        g.current.onMultiTap?.(e);
        dom(el, KRTS_EVENTS.multiTap, e);
      },
    },
    hold: o.onHold && {
      run: (_, el) => {
        const start = hold('holdstart', el);
        g.current.onHoldStart?.(start);
        dom(el, KRTS_EVENTS.holdStart, start);
        const held = hold('hold', el);
        g.current.onHold?.(held);
        dom(el, KRTS_EVENTS.hold, held);
        const end = hold('holdend', el);
        g.current.onHoldEnd?.(end);
        dom(el, KRTS_EVENTS.holdEnd, end);
      },
    },
    swipe: o.onSwipe && {
      run: ([direction], el) => {
        if (!DIRECTIONS.includes(direction as SwipeDirection)) {
          throw new AgentError(`direction must be one of ${DIRECTIONS.join(', ')}.`);
        }
        const e = { type: 'swipe' as const, direction: direction as SwipeDirection, distance: 0, velocity: 0, target: el };
        g.current.onSwipe?.(e);
        dom(el, KRTS_EVENTS.swipe, e);
      },
    },
  };
}

const menuOf = (trigger: Element) => {
  const id = trigger.getAttribute('aria-controls');
  const el = id ? trigger.ownerDocument.getElementById(id) : null;
  return el?.getAttribute('role') === 'menu' ? el : null;
};

const MENU_ITEMS = '[role=menuitem],[role=menuitemcheckbox],[role=menuitemradio]';
const menuChoices = (menu: Element) =>
  choices(menu, MENU_ITEMS, (el) => ({ selected: ariaOn(el, 'aria-checked'), disabled: ariaOn(el, 'aria-disabled') }));

export function useButtonAgent(opts: {
  mark?: KrtsAgentMark;
  hint?: string;
  isPending?: boolean;
  gestures: GestureHandlers;
}) {
  const gestures = useLatest(opts.gestures);
  const pending = !!opts.isPending;
  return useKrtsAgentComponent({
    component: 'button',
    mark: opts.mark,
    hint: opts.hint,
    state: (el) => ({
      pending: pending || undefined,
      expanded: el.hasAttribute('aria-expanded') ? ariaOn(el, 'aria-expanded') : undefined,
    }),
    actions: (el) => ({
      press: {
        run: (_, el) => {
          if (pending) throw new AgentError('This button is busy right now. Try again when it finishes.');
          press(el);
        },
      },
      // Menu triggers: pick an item, opening the menu first if needed.
      select: opensMenu(el) && {
        run: async ([item], el) => {
          if (!menuOf(el)) {
            press(el);
            if (!(await waitFor(() => !!menuOf(el)))) throw new AgentError('The menu did not open.');
          }
          press(pickChoice(menuChoices(menuOf(el)!), item).el);
        },
      },
      ...gestureActions(gestures),
    }),
  });
}

const opensMenu = (el: Element) => {
  const popup = el.getAttribute('aria-haspopup');
  return popup === 'menu' || popup === 'true';
};

export function useHoldButtonAgent(mark: KrtsAgentMark | undefined) {
  return useKrtsAgentComponent({
    component: 'hold-button',
    mark,
    confirm:
      typeof mark?.confirm === 'string' ? mark.confirm : 'This is a hold-to-confirm button, so a person must approve it.',
    label: (el) => {
      const content = el.querySelector('[data-krts-hold-label]');
      return content ? clean(textOf(content)) : undefined;
    },
    state: (el) => ({ confirmed: el.hasAttribute('data-confirmed') || undefined }),
    actions: {
      // React Aria treats a virtual click like a screen-reader activation,
      // which HoldButton confirms immediately.
      confirm: { run: (_, el) => press(el), verify: (_, el) => (el.hasAttribute('data-confirmed') ? undefined : 'The button did not confirm.') },
    },
  });
}

export function useGestureAreaAgent(mark: KrtsAgentMark | undefined, gestures: GestureHandlers) {
  const g = useLatest(gestures);
  return useKrtsAgentComponent({ component: 'gesture-area', mark, actions: gestureActions(g) });
}

export function useLinkAgent(mark: KrtsAgentMark | undefined) {
  return useKrtsAgentComponent({
    component: 'link',
    mark,
    state: (el) => ({ href: el.getAttribute('href') ?? undefined }),
    actions: { press: { run: (_, el) => press(el) } },
  });
}

/** Standalone ToggleButton. Inside a SegmentedControl the group speaks for it. */
export function useToggleButtonAgent(mark: KrtsAgentMark | undefined) {
  const inGroup = !!useContext(ToggleGroupStateContext);
  return useKrtsAgentComponent(
    !inGroup && {
      component: 'toggle-button',
      mark,
      state: (el) => ({ selected: ariaOn(el, 'aria-pressed') }),
      actions: {
        setSelected: {
          run: ([v], el) => {
            if (ariaOn(el, 'aria-pressed') !== toBool(v, 'selected')) press(el);
          },
        },
        toggle: { run: (_, el) => press(el) },
      },
    },
  );
}

/* ── toggles ──────────────────────────────────────────────────────────── */

const inputIn = (el: Element) => el.querySelector('input') as HTMLInputElement | null;

/**
 * Switch and Checkbox: clicking the real input runs React Aria's own
 * handlers (read-only, validation, onChange) exactly as a click would.
 */
const toggleSpec = (component: 'switch' | 'checkbox', mark: KrtsAgentMark | undefined): KrtsAgentComponentSpec => ({
  component,
  mark,
  label: (el) => nameOf(inputIn(el)),
  state: (el) => {
    const input = inputIn(el);
    return { checked: !!input?.checked, indeterminate: input?.indeterminate || undefined };
  },
  disabled: (el) => !!inputIn(el)?.disabled,
  actions: {
    setChecked: {
      run: ([v], el) => {
        const input = inputIn(el);
        const want = toBool(v, 'checked');
        if (input?.readOnly || el.hasAttribute('data-readonly')) throw new AgentError('This is read-only.');
        if (input && (input.checked !== want || input.indeterminate)) input.click();
      },
    },
    toggle: {
      run: (_, el) => {
        if (el.hasAttribute('data-readonly')) throw new AgentError('This is read-only.');
        inputIn(el)?.click();
      },
    },
  },
});

export function useSwitchAgent(mark: KrtsAgentMark | undefined) {
  return useKrtsAgentComponent(toggleSpec('switch', mark));
}

/** Standalone Checkbox. Inside a CheckboxGroup the group speaks for it. */
export function useCheckboxAgent(mark: KrtsAgentMark | undefined) {
  const inGroup = !!useContext(CheckboxGroupStateContext);
  return useKrtsAgentComponent(!inGroup && toggleSpec('checkbox', mark));
}

export function CheckboxGroupAgent({ id, mark }: ProbeProps) {
  const state = useLatest(useContext(CheckboxGroupStateContext));
  const list = (el: Element) => choices(el, 'input[type=checkbox]', inputChoice);
  const set = (el: Element, wanted: unknown, on: boolean | 'toggle') => {
    const c = pickChoice(list(el), wanted);
    const s = state.current!;
    if (on === 'toggle') s.toggleValue(c.item.value);
    else if (on) s.addValue(c.item.value);
    else s.removeValue(c.item.value);
  };
  useKrtsAgentComponent(
    !!state.current && {
      component: 'checkbox-group',
      mark,
      state: (el) => ({ value: selectedLabels(list(el).map((c) => c.item)) }),
      items: (el) => list(el).map((c) => c.item),
      disabled: () => !!state.current?.isDisabled,
      actions: {
        setValue: {
          run: ([values], el) => {
            if (!Array.isArray(values)) throw new AgentError('Pass a list of item labels or values, e.g. [["Email", "SMS"]].');
            const all = list(el);
            state.current!.setValue(values.map((v) => pickChoice(all, v).item.value));
          },
        },
        check: { run: ([item], el) => set(el, item, true) },
        uncheck: { run: ([item], el) => set(el, item, false) },
        toggle: { run: ([item], el) => set(el, item, 'toggle') },
      },
    },
    id,
  );
  return null;
}

export function RadioGroupAgent({ id, mark }: ProbeProps) {
  const state = useLatest(useContext(RadioGroupStateContext));
  const list = (el: Element) => choices(el, 'input[type=radio]', inputChoice);
  useKrtsAgentComponent(
    !!state.current && {
      component: 'radio-group',
      mark,
      state: (el) => ({ value: selectedLabels(list(el).map((c) => c.item))[0] ?? null }),
      items: (el) => list(el).map((c) => c.item),
      disabled: () => !!state.current?.isDisabled,
      actions: {
        setValue: {
          run: ([item], el) => {
            if (state.current!.isReadOnly) throw new AgentError('This group is read-only.');
            state.current!.setSelectedValue(pickChoice(list(el), item).item.value);
          },
        },
      },
    },
    id,
  );
  return null;
}

export function SegmentedControlAgent({ id, mark }: ProbeProps) {
  const state = useLatest(useContext(ToggleGroupStateContext));
  const list = (el: Element) =>
    choices(el, 'button', (b) => ({
      selected: ariaOn(b, 'aria-checked') || ariaOn(b, 'aria-pressed'),
      disabled: (b as HTMLButtonElement).disabled,
    }));
  useKrtsAgentComponent(
    !!state.current && {
      component: 'segmented-control',
      mark,
      state: (el) => {
        const sel = selectedLabels(list(el).map((c) => c.item));
        return { value: state.current?.selectionMode === 'multiple' ? sel : (sel[0] ?? null) };
      },
      items: (el) => list(el).map((c) => c.item),
      disabled: () => !!state.current?.isDisabled,
      actions: {
        setValue: {
          run: async ([v], el) => {
            const multiple = state.current?.selectionMode === 'multiple';
            const wanted = Array.isArray(v) ? v : [v];
            if (!multiple && wanted.length !== 1) throw new AgentError('Pick exactly one option.');
            const all = list(el);
            const targets = new Set(wanted.map((w) => pickChoice(all, w).item.value));
            for (const c of all) {
              const want = targets.has(c.item.value);
              if (want !== !!c.item.selected && (want || multiple)) {
                press(c.el);
                await settle();
              }
            }
          },
        },
      },
    },
    id,
  );
  return null;
}

/* ── fields ───────────────────────────────────────────────────────────── */

const fieldInput = (el: Element) => el.querySelector('input, textarea') as HTMLInputElement | HTMLTextAreaElement | null;
const SECRET_AUTOCOMPLETE = /\b(cc-number|cc-csc|cc-exp|one-time-code|current-password|new-password)\b/;

function fieldState(el: Element) {
  const input = fieldInput(el);
  return {
    value: input?.value ?? '',
    placeholder: input && !input.value && input.placeholder ? input.placeholder : undefined,
    required: input?.required || undefined,
    readOnly: input?.readOnly || undefined,
    invalid: el.hasAttribute('data-invalid') || input?.getAttribute('aria-invalid') === 'true' || undefined,
    error: slotText(el, 'errorMessage'),
  };
}

export function useTextFieldAgent(mark: KrtsAgentMark | undefined, component: 'textfield' | 'textarea' | 'searchfield') {
  const setValue = (el: Element, value: string) => {
    const input = fieldInput(el);
    if (!input) throw new AgentError('The field has no input.');
    if (input.readOnly) throw new AgentError('This field is read-only.');
    setNativeValue(input, value);
  };
  return useKrtsAgentComponent({
    component,
    mark,
    label: (el) => nameOf(fieldInput(el)),
    description: (el) => slotText(el, 'description'),
    state: fieldState,
    secret: (el) => {
      const input = fieldInput(el);
      return !!input && ((input as HTMLInputElement).type === 'password' || SECRET_AUTOCOMPLETE.test(input.autocomplete ?? ''));
    },
    disabled: (el) => !!fieldInput(el)?.disabled,
    actions: {
      setValue: { run: ([v], el) => setValue(el, toText(v)) },
      clear: { run: (_, el) => setValue(el, '') },
      submit:
        component === 'searchfield' && {
          run: (_, el) => {
            fieldInput(el)?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true, cancelable: true }));
          },
        },
    },
  });
}

export function NumberFieldAgent({ id, mark }: ProbeProps) {
  const state = useLatest(useContext(NumberFieldStateContext));
  useKrtsAgentComponent(
    !!state.current && {
      component: 'numberfield',
      mark,
      label: (el) => nameOf(fieldInput(el)),
      description: (el) => slotText(el, 'description'),
      state: (el) => {
        const s = state.current!;
        return {
          ...fieldState(el),
          value: Number.isNaN(s.numberValue) ? null : s.numberValue,
          min: s.minValue,
          max: s.maxValue,
        };
      },
      disabled: (el) => !!fieldInput(el)?.disabled,
      actions: {
        setValue: {
          run: ([v]) => {
            const s = state.current!;
            const n = toNumber(v);
            if (s.minValue != null && n < s.minValue) throw new AgentError(`The minimum is ${s.minValue}.`);
            if (s.maxValue != null && n > s.maxValue) throw new AgentError(`The maximum is ${s.maxValue}.`);
            s.setNumberValue(n);
          },
        },
        increment: { run: () => state.current!.increment() },
        decrement: { run: () => state.current!.decrement() },
        clear: { run: () => state.current!.setNumberValue(NaN) },
      },
    },
    id,
  );
  return null;
}

export function SliderAgent({ id, mark }: ProbeProps) {
  const state = useLatest(useContext(SliderStateContext));
  useKrtsAgentComponent(
    !!state.current && {
      component: 'slider',
      mark,
      state: () => {
        const s = state.current!;
        const values = [...s.values];
        const value = values.length === 1 ? values[0] : values;
        const valueText = values.map((_, i) => s.getThumbValueLabel(i)).join(' – ');
        return {
          value,
          min: s.getThumbMinValue(0),
          max: s.getThumbMaxValue(values.length - 1),
          step: s.step,
          valueText: valueText === values.join(' – ') ? undefined : valueText,
        };
      },
      disabled: () => !!state.current?.isDisabled,
      actions: {
        setValue: {
          run: async ([v]) => {
            const count = state.current!.values.length;
            const targets = (Array.isArray(v) ? v : [v]).map((x) => toNumber(x));
            if (targets.length !== count) throw new AgentError(count === 1 ? 'Pass one number.' : `Pass ${count} numbers, one per thumb.`);
            // Range thumbs limit each other, so a second pass settles any order.
            for (let pass = 0; pass < 2; pass++) {
              for (let i = 0; i < count; i++) {
                const s = state.current!;
                if (s.values[i] === targets[i]) continue;
                s.setThumbDragging(i, true);
                s.setThumbValue(i, targets[i]!);
                s.setThumbDragging(i, false);
                await settle();
              }
            }
          },
        },
        increment: { run: () => state.current!.incrementThumb(0) },
        decrement: { run: () => state.current!.decrementThumb(0) },
      },
    },
    id,
  );
  return null;
}

/* ── collections ──────────────────────────────────────────────────────── */

interface KeyedItem {
  key: Key;
  item: KrtsAgentItem;
}

function collectionItems(
  collection: { getKeys(): Iterable<Key>; getItem(key: Key): { type: string; key: Key; textValue: string } | null },
  disabledKeys: Set<Key>,
  isSelected: (key: Key) => boolean,
  labelAt?: (index: number) => string,
): KeyedItem[] {
  const out: KeyedItem[] = [];
  for (const key of collection.getKeys()) {
    const node = collection.getItem(key);
    if (!node || node.type !== 'item') continue;
    const label = clean(node.textValue) || labelAt?.(out.length) || String(key);
    const item: KrtsAgentItem = { value: String(key), label };
    if (isSelected(key)) item.selected = true;
    if (disabledKeys.has(key)) item.disabled = true;
    out.push({ key, item });
  }
  return out;
}

function pickKeyed(list: KeyedItem[], wanted: unknown): Key {
  const item = pickItem(
    list.map((k) => k.item),
    wanted,
  );
  if (item.disabled) throw new AgentError(`“${item.label}” is disabled.`);
  return list.find((k) => k.item === item)!.key;
}

export function SelectAgent({ id, mark }: ProbeProps) {
  const state = useLatest(useContext(SelectStateContext));
  const list = () => {
    const s = state.current!;
    const keys = s.selectionManager.selectedKeys;
    return collectionItems(s.collection, s.disabledKeys, (k) => keys.has(k));
  };
  const multiple = () => state.current?.selectionManager.selectionMode === 'multiple';
  useKrtsAgentComponent(
    !!state.current && {
      component: 'select',
      mark,
      overlay: () => !!state.current?.isOpen,
      // The trigger is labelled by "<value> <label>"; keep the label part.
      label: (el) => {
        const button = el.querySelector('button');
        if (!button) return undefined;
        const ids = (button.getAttribute('aria-labelledby') ?? '').split(/\s+/).filter(Boolean);
        const outside = ids.map((i) => el.ownerDocument.getElementById(i)).filter((n): n is HTMLElement => !!n && !button.contains(n));
        return clean(outside.map((n) => textOf(n)).join(' ')) || clean(button.getAttribute('aria-label'));
      },
      description: (el) => slotText(el, 'description'),
      state: (el) => {
        const sel = selectedLabels(list().map((k) => k.item));
        return {
          value: multiple() ? sel : (sel[0] ?? null),
          open: !!state.current?.isOpen,
          required: el.hasAttribute('data-required') || undefined,
          invalid: el.hasAttribute('data-invalid') || undefined,
          error: slotText(el, 'errorMessage'),
        };
      },
      items: () => list().map((k) => k.item),
      actions: {
        setValue: {
          run: ([v]) => {
            const all = list();
            if (v == null) return state.current!.setValue(null);
            if (Array.isArray(v)) {
              if (!multiple()) throw new AgentError('This select takes one option.');
              return state.current!.setValue(v.map((x) => pickKeyed(all, x)));
            }
            const key = pickKeyed(all, v);
            state.current!.setValue(multiple() ? [key] : key);
          },
          verify: ([v]) => {
            if (v == null || Array.isArray(v)) return undefined;
            return state.current!.selectionManager.selectedKeys.size ? undefined : 'The selection did not change.';
          },
        },
        clear: { run: () => state.current!.setValue(multiple() ? [] : null) },
        open: { safe: true, run: () => state.current!.open() },
        close: { safe: true, run: () => state.current!.close() },
      },
    },
    id,
  );
  return null;
}

export function TabsAgent({ id, mark }: ProbeProps) {
  const state = useLatest(useContext(TabListStateContext));
  const list = (el: Element) => {
    const s = state.current!;
    const tabs = Array.from(el.querySelectorAll('[role=tab]'));
    return collectionItems(s.collection, s.disabledKeys, (k) => k === s.selectedKey, (i) => nameOf(tabs[i]));
  };
  useKrtsAgentComponent(
    !!state.current && {
      component: 'tabs',
      mark,
      label: (el) => nameOf(el.querySelector('[role=tablist]')) || 'Tabs',
      state: (el) => ({ value: selectedLabels(list(el).map((k) => k.item))[0] ?? null }),
      items: (el) => list(el).map((k) => k.item),
      disabled: () => !!state.current?.isDisabled,
      actions: {
        // Switching tabs only changes what's shown.
        setValue: { safe: true, run: ([v], el) => state.current!.setSelectedKey(pickKeyed(list(el), v)) },
      },
    },
    id,
  );
  return null;
}

export function DisclosureAgent({ id, mark }: ProbeProps) {
  const state = useLatest(useContext(DisclosureStateContext));
  useKrtsAgentComponent(
    !!state.current && {
      component: 'disclosure',
      mark,
      label: (el) => nameOf(el.querySelector('[slot=trigger]')),
      state: () => ({ expanded: !!state.current?.isExpanded }),
      actions: {
        expand: { safe: true, run: () => state.current!.expand() },
        collapse: { safe: true, run: () => state.current!.collapse() },
        toggle: { safe: true, run: () => state.current!.toggle() },
      },
    },
    id,
  );
  return null;
}

/* ── overlays ─────────────────────────────────────────────────────────── */

export function DialogAgent({ id, mark, close }: ProbeProps & { close: () => void }) {
  const doClose = useLatest(close);
  useKrtsAgentComponent(
    {
      component: 'dialog',
      mark,
      overlay: true,
      state: (el) => ({ role: el.getAttribute('role') === 'alertdialog' ? 'alertdialog' : undefined }),
      description: (el) => {
        const d = el.querySelector('[data-krts-dialog-description]');
        return d ? clean(textOf(d)) : undefined;
      },
      actions: { close: { safe: true, run: () => doClose.current() } },
    },
    id,
  );
  return null;
}

export function useMenuAgent(mark: KrtsAgentMark | undefined, close: (() => void) | undefined) {
  const doClose = useLatest(close);
  return useKrtsAgentComponent({
    component: 'menu',
    mark,
    overlay: true,
    items: (el) => menuChoices(el).map((c) => c.item),
    actions: {
      select: { run: ([item], el) => press(pickChoice(menuChoices(el), item).el) },
      close: !!close && { safe: true, run: () => doClose.current?.() },
    },
  });
}

/* ── feedback ─────────────────────────────────────────────────────────── */

export function useProgressAgent(mark: KrtsAgentMark | undefined, component: 'progressbar' | 'meter') {
  return useKrtsAgentComponent({
    component,
    mark,
    state: (el) => {
      const now = el.getAttribute('aria-valuenow');
      return {
        value: now == null ? null : Number(now),
        min: Number(el.getAttribute('aria-valuemin') ?? 0),
        max: Number(el.getAttribute('aria-valuemax') ?? 100),
        valueText: el.getAttribute('aria-valuetext') ?? undefined,
      };
    },
  });
}
