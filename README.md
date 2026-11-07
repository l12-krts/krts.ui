# krts.ui

An accessible React UI library built on [React Aria Components](https://react-spectrum.adobe.com/react-aria/) and [Tailwind CSS v4](https://tailwindcss.com).

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

## Development

```bash
npm run dev          # docs / playground
npm test             # vitest
npm run typecheck
npm run build        # dist/ (ESM + CJS + d.ts + krts.css)
npm run build:docs   # static docs site in docs/dist
```
