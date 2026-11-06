# krts.ui

An accessible React UI library built on [React Aria Components](https://react-spectrum.adobe.com/react-aria/) and [Tailwind CSS v4](https://tailwindcss.com).

- **Gesture events on every button.** `onSingleTap`, `onDoubleTap`, `onMultiTap`, `onHold`, `onHoldTick` (hold for N seconds), `onSwipe`. They work with mouse, touch, pen, and keyboard, and each one also fires a bubbling `krts:*` DOM event.
- **`HoldButton`.** Hold to confirm, instead of an "Are you sure?" dialog.
- **Tooltips that feel fast.** After the first tooltip opens, its neighbours open instantly with no animation.
- **Perceived-performance helpers.** No-flicker pending states, progress that is fast at first and only hits 100% when the work is done, skeletons, and toasts with Undo for optimistic updates.
- **Motion only where it helps:** buttons don't scale when pressed; they use the Figma pressed colours instead. When a button's label changes, it eases to its new width. Menus and selects use a quick fade by default (suited to dashboards), with a scale animation available. Sliders glide on clicks and key presses but follow your finger exactly while dragging. Exits are faster than entrances, hover styles only apply on devices that can hover, and `prefers-reduced-motion` is respected.

The visual design comes from the krts.ui Figma file: monochrome Inter, 48px controls, 8px radius, 1px hairline borders and shadows, and the split dropdown button. It is refined for contrast and adds a dark theme.

```bash
npm i krts.ui
```

Run the docs/playground locally with `npm run dev`.

---

## Setup

### With Tailwind v4 (recommended)

```css
/* app.css */
@import "tailwindcss";
@import "krts.ui/tailwind.css"; /* theme tokens + scans krts.ui's built classes */
```

### Without Tailwind

```ts
import 'krts.ui/styles.css'; // precompiled
```

### Dark mode

Add `class="dark"` or `data-theme="dark"` to `<html>` (or to any subtree).

### Theming

Every colour is a CSS variable:

```css
:root {
  --krts-primary: #3b2bff;
  --krts-primary-hover: #4c3dff;
  --krts-primary-pressed: #5b4dff;
  --krts-primary-line: #2a1de0;
}
```

---

## Usage

```tsx
import { Button, HoldButton, Toaster, toast, WithTooltip } from 'krts.ui';

export function App() {
  return (
    <>
      <Toaster />
      <WithTooltip content="Saves to the cloud" shortcut="⌘S">
        <Button variant="primary" onPress={save}>Save</Button>
      </WithTooltip>

      <HoldButton onConfirm={deleteProject}>Delete project</HoldButton>
    </>
  );
}
```

## Animation options

### Menus, selects and popovers

```tsx
<Select animation="scale" …/>          // grows out of its trigger
<DropdownButton animation="none" …/>   // instant
<Menu animation="fade" …/>             // default: a quick 120ms fade

// Set the default for the whole app (a prop on a component still wins)
<KrtsProvider menuAnimation="scale">
  <App />
</KrtsProvider>
```

### Button width

When a `Button`'s or `HoldButton`'s content changes ("Follow" → "Following ✓"), the button eases to its new width over 250ms with an ease-out curve instead of jumping. The first layout and the web-font swap are not animated. Width animation is off for icon-only buttons. Pass `animateWidth={false}` if you size the button yourself, for example with `w-full`.

The same behaviour is available for your own components through `useAnimatedWidth()`.

### Slider

Clicking the track, pressing arrow keys, or changing the value in code makes the thumb and fill glide there with a 200ms ease-out. While you drag, the thumb follows the pointer exactly, with no lag. On hover and while dragging, a soft halo appears around the thumb instead of scaling it.

## Gesture events

The gesture props work on `Button`, `GestureArea`, and anything that uses `useGesture`.

| Prop | Fires when | Notes |
| --- | --- | --- |
| `onSingleTap(e)` | A tap that is *not* part of a double or multi tap | Fires immediately if no double tap is possible; otherwise waits `multiTapDelay` (250ms) |
| `onDoubleTap(e)` | Two taps within `multiTapDelay` | |
| `onMultiTap(e)` | The end of every tap sequence | `e.count` is 1, 2, 3, … up to `maxTaps` (default 3) |
| `onHoldStart(e)` | Press begins | |
| `onHold(e)` | Held for `holdDuration` (default 500ms) | A hold never also counts as a tap |
| `onHoldTick(e)` | Every `holdTickInterval` (default 1000ms) while held | `e.seconds` is 1, 2, 3, … |
| `onHoldProgress(p)` | Every frame while held | `p` goes from 0 to 1 |
| `onHoldEnd(e)` | Released after `onHold` fired | `e.duration` is in ms |
| `onHoldCancel(e)` | Released, or the pointer moved away, before `holdDuration` | Includes ordinary taps |
| `onSwipe(e)` | Flick or drag | `e.direction` is `left`, `right`, `up` or `down`. A quick flick (> 0.11 px/ms) counts even if it's short |

```tsx
<Button
  onSingleTap={select}
  onDoubleTap={open}
  onHold={showContextMenu}
  holdDuration={600}
>
  photo.jpg
</Button>

// Hold for 3 seconds, counting up
<Button holdDuration={3000} onHoldTick={(e) => setSeconds(e.seconds)} onHold={launch}>
  Hold to launch
</Button>

// Any element
const { gestureProps, isPressed } = useGesture({ onDoubleTap: like });
<div {...gestureProps} role="button" tabIndex={0} />

// Outside React
el.addEventListener('krts:doubletap', (e) => console.log(e.detail.count));
```

**Keyboard:** Enter or Space taps, and holding Enter or Space holds. Moving the pointer more than `moveTolerance` (10px) cancels the tap or hold. Only the first finger on a touch screen is tracked.

## HoldButton

```tsx
<HoldButton
  onConfirm={() => remove()}
  holdDuration={2000}              // default
  variant="danger"                  // 'danger' | 'primary' | 'secondary'
  confirmedContent="Deleted"
  hint="Hold to confirm"            // shown if someone just taps
>
  Delete project
</HoldButton>
```

The fill moves slowly and linearly while the user holds, and snaps back in 200ms when they let go. The filled area is a clipped copy of the label, so the text colour flips exactly at the fill edge. Screen-reader activation can't hold, so it confirms straight away. The button's accessible description says how long to hold.

## Components

| Category | Components |
| --- | --- |
| Actions | `Button`, `HoldButton`, `CopyButton`, `ToggleButton`, `DropdownButton`, `SplitButton`, `GestureArea` |
| Menus & overlays | `Menu`, `MenuItem`, `MenuSection`, `MenuSeparator`, `SubmenuTrigger`, `Popover`, `Tooltip`, `TooltipTrigger`, `WithTooltip`, `Dialog`, `AlertDialog`, `Modal`, `Drawer` (left, right, bottom) |
| Forms | `TextField`, `TextAreaField`, `SearchField`, `NumberField`, `Select`, `Checkbox`, `CheckboxGroup`, `RadioGroup`, `Radio`, `Switch`, `Slider` (single or range) |
| Navigation | `Tabs` (pill and underline styles), `SegmentedControl`, `Link`, `Accordion`, `Disclosure` |
| Feedback | `Toaster` + `toast()`, `ProgressBar`, `Meter`, `Spinner`, `Skeleton` |
| Display | `Badge`, `Avatar`, `Kbd`, `Card`, `Separator` |
| Hooks | `useGesture`, `useGestureHandlers`, `useAnimatedWidth`, `useSmoothPending`, `usePerceivedProgress`, `usePrefersReducedMotion` |
| Config | `KrtsProvider` (`menuAnimation`), `useKrtsConfig` |

### Toasts

```ts
toast('Saved');
toast.success('Uploaded', { description: 'photo.jpg' });
toast('Conversation archived', { action: { label: 'Undo', onPress: restore } });
toast.promise(deploy(), { loading: 'Deploying…', success: 'Live', error: 'Failed' });
```

Toasts stack and spread out when you hover over them. Swipe or flick one to dismiss it. Timers pause while you hover and while the tab is hidden.

## Perceived performance

Small UI tricks that make waiting feel shorter without hiding anything from the user:

- **`isPending` on `Button`** (via `useSmoothPending`): no spinner for work that finishes in under 150ms. Once a spinner is shown, it stays for at least 500ms so it never flickers.
- **`usePerceivedProgress(running, done)`**: when you don't know the real progress, the bar moves quickly at first, slows near 92%, and jumps to 100% only when the work is actually done.
- **Optimistic UI**: update the UI first, then offer Undo in a toast.
- **`Skeleton`**: placeholders shaped like the real content, so the layout doesn't jump.
- **Fast `Spinner`** (600ms per turn): a faster spinner makes the same wait feel shorter.

## Development

```bash
npm run dev          # docs / playground
npm test             # vitest
npm run typecheck
npm run build        # dist/ (ESM + CJS + d.ts + krts.css)
npm run build:docs   # static docs site in docs/dist
```
