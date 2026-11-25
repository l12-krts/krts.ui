/**
 * Names of the DOM CustomEvents krts.ui dispatches. They bubble, so
 * non-React code can listen with `el.addEventListener('krts:doubletap', …)`.
 */
export const KRTS_EVENTS = {
  singleTap: 'krts:singletap',
  doubleTap: 'krts:doubletap',
  multiTap: 'krts:multitap',
  holdStart: 'krts:holdstart',
  hold: 'krts:hold',
  holdTick: 'krts:holdtick',
  holdEnd: 'krts:holdend',
  holdCancel: 'krts:holdcancel',
  swipe: 'krts:swipe',
  confirm: 'krts:confirm',
  /** Before an agent step runs, on its target. Cancelable: `preventDefault()` refuses the step. */
  agentAct: 'krts:agentact',
  /** After an agent step changed a component's state, on that component. */
  agentChange: 'krts:agentchange',
} as const;

export type KrtsEventName = (typeof KRTS_EVENTS)[keyof typeof KRTS_EVENTS];

export function dispatchKrtsEvent<D>(target: EventTarget | null | undefined, name: KrtsEventName, detail: D) {
  if (!target || typeof CustomEvent === 'undefined') return;
  target.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
}
