import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DOMAttributes, PointerEvent as ReactPointerEvent } from 'react';
import { mergeProps, usePress, type PressEvent, type PressEvents } from 'react-aria';
import { dispatchKrtsEvent, KRTS_EVENTS } from '../lib/dom-events';

export type GesturePointerType = PressEvent['pointerType'];

export interface TapGestureEvent {
  type: 'singletap' | 'doubletap' | 'multitap';
  /** Number of taps in the sequence (1 = single, 2 = double, …). */
  count: number;
  pointerType: GesturePointerType;
  target: Element;
}

export interface HoldGestureEvent {
  type: 'holdstart' | 'hold' | 'holdtick' | 'holdend' | 'holdcancel';
  /** Milliseconds since the press started. */
  duration: number;
  /** Whole seconds held (handy for `hold(sec)`-style logic). */
  seconds: number;
  /** 0 → 1 progress toward `holdDuration`. */
  progress: number;
  pointerType: GesturePointerType;
  target: Element;
}

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface SwipeGestureEvent {
  type: 'swipe';
  direction: SwipeDirection;
  /** Distance travelled along the dominant axis, in px. */
  distance: number;
  /** px / ms along the dominant axis. */
  velocity: number;
  target: Element;
}

export interface GestureOptions {
  /** Fires once a tap is confirmed *not* to be part of a double/multi tap. */
  onSingleTap?: (e: TapGestureEvent) => void;
  /** Fires when two taps land within `multiTapDelay`. */
  onDoubleTap?: (e: TapGestureEvent) => void;
  /** Fires at the end of every tap sequence with the final `count`. */
  onMultiTap?: (e: TapGestureEvent) => void;
  /** Highest tap count to wait for when `onMultiTap` is used. Default 3. */
  maxTaps?: number;
  /** Max gap between taps in a sequence, ms. Default 250. */
  multiTapDelay?: number;

  /** Press began; a hold is now possible. */
  onHoldStart?: (e: HoldGestureEvent) => void;
  /** Held for `holdDuration` ms. A hold never also counts as a tap. */
  onHold?: (e: HoldGestureEvent) => void;
  /** Fires every `holdTickInterval` ms while held — e.g. at 1s, 2s, 3s. */
  onHoldTick?: (e: HoldGestureEvent) => void;
  /** Called every animation frame with 0 → 1 progress while held. */
  onHoldProgress?: (progress: number) => void;
  /** Released after `onHold` fired. */
  onHoldEnd?: (e: HoldGestureEvent) => void;
  /** Released (or interrupted) before `holdDuration`. */
  onHoldCancel?: (e: HoldGestureEvent) => void;
  /** ms before `onHold` fires. Default 500. */
  holdDuration?: number;
  /** ms between `onHoldTick` calls. Default 1000. */
  holdTickInterval?: number;

  /** Quick flick or long drag on touch/pen/mouse. */
  onSwipe?: (e: SwipeGestureEvent) => void;
  /** Minimum travel for a swipe, px. Default 40. */
  swipeThreshold?: number;
  /** A flick faster than this (px/ms) counts even under the threshold. Default 0.11. */
  swipeVelocity?: number;

  /** Movement (px) after which a press stops counting as a tap or hold. Default 10. */
  moveTolerance?: number;
  /** Also dispatch bubbling `krts:*` DOM CustomEvents. Default true. */
  dispatchDomEvents?: boolean;
  isDisabled?: boolean;
}

export interface GestureState {
  isPressed: boolean;
  isHolding: boolean;
  /** True once `onHold` has fired during the current press. */
  didHold: boolean;
}

interface Internal {
  taps: number;
  tapTimer: ReturnType<typeof setTimeout> | undefined;
  lastTarget: Element | null;
  lastPointer: GesturePointerType;
  pressStart: number;
  holdTimer: ReturnType<typeof setTimeout> | undefined;
  tickTimer: ReturnType<typeof setInterval> | undefined;
  raf: number | undefined;
  holdFired: boolean;
  holdSettled: boolean;
  pressActive: boolean;
  moved: boolean;
  pointerId: number | null;
  origin: { x: number; y: number; t: number } | null;
}

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

/**
 * Low-level gesture engine. Returns React Aria press handlers (so it
 * composes with any RAC component that takes `onPressStart`/`onPress`…)
 * and pointer handlers for movement-based gestures (swipe, tap cancel).
 */
export function useGestureHandlers(options: GestureOptions) {
  const opts = useRef(options);
  opts.current = options;

  const s = useRef<Internal>({
    taps: 0,
    tapTimer: undefined,
    lastTarget: null,
    lastPointer: 'mouse',
    pressStart: 0,
    holdTimer: undefined,
    tickTimer: undefined,
    raf: undefined,
    holdFired: false,
    holdSettled: false,
    pressActive: false,
    moved: false,
    pointerId: null,
    origin: null,
  }).current;

  const [state, setState] = useState<GestureState>({ isPressed: false, isHolding: false, didHold: false });

  const holdEvent = useCallback(
    (type: HoldGestureEvent['type']): HoldGestureEvent => {
      const duration = s.pressStart ? now() - s.pressStart : 0;
      const holdDuration = opts.current.holdDuration ?? 500;
      return {
        type,
        duration,
        seconds: Math.floor(duration / 1000),
        progress: Math.min(1, duration / holdDuration),
        pointerType: s.lastPointer,
        target: s.lastTarget as Element,
      };
    },
    [s],
  );

  const emit = useCallback(
    (name: (typeof KRTS_EVENTS)[keyof typeof KRTS_EVENTS], detail: unknown) => {
      if (opts.current.dispatchDomEvents === false) return;
      dispatchKrtsEvent(s.lastTarget, name, detail);
    },
    [s],
  );

  const stopHoldTimers = useCallback(() => {
    clearTimeout(s.holdTimer);
    clearInterval(s.tickTimer);
    if (s.raf !== undefined) cancelAnimationFrame(s.raf);
    s.holdTimer = undefined;
    s.tickTimer = undefined;
    s.raf = undefined;
  }, [s]);

  const resolveTaps = useCallback(() => {
    clearTimeout(s.tapTimer);
    s.tapTimer = undefined;
    const count = s.taps;
    s.taps = 0;
    if (count === 0 || !s.lastTarget) return;
    const o = opts.current;
    const base = { count, pointerType: s.lastPointer, target: s.lastTarget };
    if (count === 1 && o.onSingleTap) {
      const e: TapGestureEvent = { ...base, type: 'singletap' };
      o.onSingleTap(e);
      emit(KRTS_EVENTS.singleTap, e);
    } else if (count === 1) {
      emit(KRTS_EVENTS.singleTap, { ...base, type: 'singletap' });
    }
    if (count === 2) {
      const e: TapGestureEvent = { ...base, type: 'doubletap' };
      o.onDoubleTap?.(e);
      emit(KRTS_EVENTS.doubleTap, e);
    }
    const multi: TapGestureEvent = { ...base, type: 'multitap' };
    o.onMultiTap?.(multi);
    emit(KRTS_EVENTS.multiTap, multi);
  }, [s, emit]);

  /** How many taps could still be coming? Decides whether a single tap must wait. */
  const maxTaps = () => {
    const o = opts.current;
    if (o.onMultiTap) return Math.max(2, o.maxTaps ?? 3);
    if (o.onDoubleTap) return 2;
    return 1;
  };

  const cancelHold = useCallback(
    (fireCancel: boolean) => {
      const wasActive = s.pressActive;
      stopHoldTimers();
      if (wasActive && fireCancel && !s.holdFired && !s.holdSettled) {
        s.holdSettled = true;
        const e = holdEvent('holdcancel');
        opts.current.onHoldCancel?.(e);
        emit(KRTS_EVENTS.holdCancel, e);
      }
      opts.current.onHoldProgress?.(0);
      setState((p) => (p.isHolding ? { ...p, isHolding: false } : p));
    },
    [s, stopHoldTimers, holdEvent, emit],
  );

  const onPressStart = useCallback(
    (e: PressEvent) => {
      if (opts.current.isDisabled) return;
      const o = opts.current;
      // A new press inside a tap sequence: hold the sequence open.
      clearTimeout(s.tapTimer);
      s.tapTimer = undefined;
      s.lastTarget = e.target;
      s.lastPointer = e.pointerType;
      s.pressStart = now();
      s.holdFired = false;
      s.holdSettled = false;
      s.pressActive = true;
      s.moved = false;
      setState({ isPressed: true, isHolding: true, didHold: false });

      const startEvt = holdEvent('holdstart');
      o.onHoldStart?.(startEvt);
      emit(KRTS_EVENTS.holdStart, startEvt);

      const holdDuration = o.holdDuration ?? 500;
      s.holdTimer = setTimeout(() => {
        s.holdFired = true;
        s.taps = 0; // a hold breaks any tap sequence
        const he = holdEvent('hold');
        opts.current.onHold?.(he);
        emit(KRTS_EVENTS.hold, he);
        setState((p) => ({ ...p, didHold: true }));
      }, holdDuration);

      const tickInterval = o.holdTickInterval ?? 1000;
      let ticks = 0;
      s.tickTimer = setInterval(() => {
        ticks += 1;
        // Count from ticks, not the clock, so seconds never come out as 0.999 → 0.
        const te = { ...holdEvent('holdtick'), seconds: Math.floor((ticks * tickInterval) / 1000) };
        opts.current.onHoldTick?.(te);
        emit(KRTS_EVENTS.holdTick, te);
      }, tickInterval);
      if (o.onHoldProgress && typeof requestAnimationFrame !== 'undefined') {
        const loop = () => {
          const p = Math.min(1, (now() - s.pressStart) / (opts.current.holdDuration ?? 500));
          opts.current.onHoldProgress?.(p);
          s.raf = p < 1 ? requestAnimationFrame(loop) : undefined;
        };
        s.raf = requestAnimationFrame(loop);
      }
    },
    [s, holdEvent, emit],
  );

  const onPressEnd = useCallback(
    (_e: PressEvent) => {
      if (!s.pressActive) return;
      if (s.holdFired) {
        const e = holdEvent('holdend');
        opts.current.onHoldEnd?.(e);
        emit(KRTS_EVENTS.holdEnd, e);
      }
      cancelHold(true);
      s.pressActive = false;
      setState((p) => ({ ...p, isPressed: false, isHolding: false }));
      // If this press was cancelled (no onPress), still resolve any earlier taps.
      if (s.taps > 0 && !s.tapTimer) {
        s.tapTimer = setTimeout(resolveTaps, opts.current.multiTapDelay ?? 250);
      }
    },
    [s, holdEvent, emit, cancelHold, resolveTaps],
  );

  const onPress = useCallback(
    (e: PressEvent) => {
      if (opts.current.isDisabled || s.holdFired || s.moved) return;
      s.lastTarget = e.target;
      s.lastPointer = e.pointerType;
      s.taps += 1;
      clearTimeout(s.tapTimer);
      // Only make a single tap wait if a double/multi tap is actually possible.
      if (s.taps >= maxTaps()) resolveTaps();
      else s.tapTimer = setTimeout(resolveTaps, opts.current.multiTapDelay ?? 250);
    },
    [s, resolveTaps],
  );

  // ── movement: tap/hold cancellation + swipe ────────────────────────────
  const onPointerDown = useCallback(
    (e: ReactPointerEvent<Element>) => {
      if (opts.current.isDisabled || !e.isPrimary) return;
      // Multi-touch protection: ignore extra fingers once tracking.
      if (s.pointerId !== null) return;
      s.pointerId = e.pointerId;
      s.origin = { x: e.clientX, y: e.clientY, t: now() };
    },
    [s],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<Element>) => {
      if (e.pointerId !== s.pointerId || !s.origin) return;
      const dx = e.clientX - s.origin.x;
      const dy = e.clientY - s.origin.y;
      if (!s.moved && Math.hypot(dx, dy) > (opts.current.moveTolerance ?? 10)) {
        s.moved = true;
        if (!s.holdFired) cancelHold(true);
      }
    },
    [s, cancelHold],
  );

  const endPointer = useCallback(
    (e: ReactPointerEvent<Element>, cancelled: boolean) => {
      if (e.pointerId !== s.pointerId || !s.origin) return;
      const origin = s.origin;
      s.pointerId = null;
      s.origin = null;
      const o = opts.current;
      if (cancelled || !o.onSwipe) return;
      const dx = e.clientX - origin.x;
      const dy = e.clientY - origin.y;
      const horizontal = Math.abs(dx) >= Math.abs(dy);
      const distance = Math.abs(horizontal ? dx : dy);
      const elapsed = Math.max(1, now() - origin.t);
      const velocity = distance / elapsed;
      // A quick flick is enough — don't demand a long drag.
      if (distance >= (o.swipeThreshold ?? 40) || (distance > 10 && velocity > (o.swipeVelocity ?? 0.11))) {
        const direction: SwipeDirection = horizontal ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
        const se: SwipeGestureEvent = { type: 'swipe', direction, distance, velocity, target: e.currentTarget };
        o.onSwipe(se);
        if (o.dispatchDomEvents !== false) dispatchKrtsEvent(e.currentTarget, KRTS_EVENTS.swipe, se);
      }
    },
    [s],
  );

  const pointerProps = useMemo(
    () => ({
      onPointerDown,
      onPointerMove,
      onPointerUp: (e: ReactPointerEvent<Element>) => endPointer(e, false),
      onPointerCancel: (e: ReactPointerEvent<Element>) => endPointer(e, true),
      onContextMenu: (e: React.MouseEvent) => {
        // Stop the long-press context menu on touch from stealing a hold.
        const o = opts.current;
        if ((o.onHold || o.onHoldTick) && s.lastPointer === 'touch') e.preventDefault();
      },
      'data-krts-gesture': '',
    }),
    [onPointerDown, onPointerMove, endPointer, s],
  );

  const pressHandlers: Required<Pick<PressEvents, 'onPressStart' | 'onPressEnd' | 'onPress'>> = useMemo(
    () => ({ onPressStart, onPressEnd, onPress }),
    [onPressStart, onPressEnd, onPress],
  );

  useEffect(
    () => () => {
      clearTimeout(s.tapTimer);
      stopHoldTimers();
    },
    [s, stopHoldTimers],
  );

  return { pressHandlers, pointerProps, state };
}

export interface UseGestureResult {
  /** Spread onto any element (div, img, canvas…) to give it gesture events. */
  gestureProps: DOMAttributes<Element> & Record<string, unknown>;
  isPressed: boolean;
  isHolding: boolean;
  didHold: boolean;
}

/**
 * Give any element `singleTap`, `doubleTap`, `multiTap`, `hold`,
 * `holdTick` and `swipe` events — with keyboard (Enter/Space) and
 * screen-reader support via React Aria's `usePress`.
 *
 * ```tsx
 * const { gestureProps } = useGesture({
 *   onSingleTap: () => select(),
 *   onDoubleTap: () => like(),
 *   onHold: () => openMenu(),
 *   holdDuration: 600,
 * });
 * return <div {...gestureProps} tabIndex={0}>…</div>;
 * ```
 */
export function useGesture(options: GestureOptions): UseGestureResult {
  const { pressHandlers, pointerProps, state } = useGestureHandlers(options);
  const { pressProps } = usePress({ ...pressHandlers, isDisabled: options.isDisabled });
  return {
    gestureProps: mergeProps(pressProps, pointerProps) as unknown as UseGestureResult['gestureProps'],
    isPressed: state.isPressed,
    isHolding: state.isHolding,
    didHold: state.didHold,
  };
}
