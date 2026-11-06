import { useEffect, useRef, useState } from 'react';
import { Button, Dialog, DialogTrigger, GestureArea, KRTS_EVENTS, Modal, Skeleton, toast, useGesture } from 'krts.ui';
import { Entry, Example, I, Ico } from '../ui';

export function GestureAreaEntry() {
  const [log, setLog] = useState<string[]>([]);
  const push = (s: string) => setLog((l) => [s, ...l].slice(0, 8));
  const boxRef = useRef<HTMLDivElement>(null);

  // Native CustomEvents bubble too — useful outside React.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const on = (e: Event) => push(`DOM ${e.type}`);
    el.addEventListener(KRTS_EVENTS.doubleTap, on);
    return () => el.removeEventListener(KRTS_EVENTS.doubleTap, on);
  }, []);

  return (
    <Entry id="gesture-area" title="GestureArea">
      <Example
        className="block"
        code={`<GestureArea
  aria-label="Gesture pad"
  holdDuration={600}
  onSingleTap={(e) => log(\`singleTap (\${e.pointerType})\`)}
  onDoubleTap={(e) => log(\`doubleTap (\${e.pointerType})\`)}
  onHold={(e) => log(\`hold \${e.duration}ms\`)}
  onHoldTick={(e) => log(\`holdTick \${e.seconds}s\`)}
  onHoldEnd={(e) => log(\`holdEnd after \${e.duration}ms\`)}
  onSwipe={(e) => log(\`swipe \${e.direction}\`)}
  className="data-[holding]:bg-surface-hover data-[held]:bg-surface-pressed"
>
  Gesture Pad
</GestureArea>

// Every gesture also fires a bubbling DOM event
el.addEventListener(KRTS_EVENTS.doubleTap, (e) => console.log(e.detail.count));`}
      >
        <div className="grid w-full gap-6 md:grid-cols-[1fr_240px]">
          <div ref={boxRef}>
            <GestureArea
              aria-label="Gesture pad"
              onSingleTap={(e) => push(`singleTap (${e.pointerType})`)}
              onDoubleTap={(e) => push(`doubleTap (${e.pointerType})`)}
              onHold={(e) => push(`hold ${(e.duration / 1000).toFixed(1)}s`)}
              onHoldTick={(e) => push(`holdTick ${e.seconds}s`)}
              onHoldEnd={(e) => push(`holdEnd after ${(e.duration / 1000).toFixed(1)}s`)}
              onSwipe={(e) => push(`swipe ${e.direction} (${e.velocity.toFixed(2)}px/ms)`)}
              holdDuration={600}
              className="grid h-56 place-items-center rounded-[14px] border border-dashed border-line-strong bg-surface/50 text-center text-fg-muted transition-[background-color] duration-150 ease-out data-[pressed]:bg-surface data-[holding]:bg-surface-hover data-[held]:bg-surface-pressed"
            >
              <div>
                <div className="text-[15px] text-fg">Gesture Pad</div>
                <div className="mt-1 text-sm">Tap, Double tap, Swipe or Hold</div>
              </div>
            </GestureArea>
          </div>
          <ol
            aria-label="Gesture log"
            aria-live="polite"
            className="flex h-56 flex-col gap-1 overflow-hidden rounded-[14px] border border-line-subtle p-3 font-mono text-[12.5px]"
          >
            {log.length === 0 && <li className="text-fg-subtle">Events appear here…</li>}
            {log.map((l, i) => (
              <li key={log.length - i} className="text-fg-muted transition-opacity duration-200 starting:opacity-0 first:text-fg">
                {l}
              </li>
            ))}
          </ol>
        </div>
      </Example>
    </Entry>
  );
}

export function ButtonGesturesEntry() {
  const [likes, setLikes] = useState(0);
  const [heart, setHeart] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [count, setCount] = useState(0);
  return (
    <Entry id="button-gestures" title="Gestures on Button">
      <Example
        code={`<Button
  onSingleTap={() => toast('Double-tap to like')}
  onDoubleTap={like}
  startContent={<HeartIcon />}
>
  {likes} likes
</Button>

<Button
  variant="primary"
  holdDuration={3000}
  onHoldStart={() => setSeconds(0)}
  onHoldTick={(e) => setSeconds(e.seconds)}
  onHold={() => toast.success('Held for 3 seconds')}
  onHoldCancel={() => setSeconds(0)}
>
  Hold for 3s · {seconds}s
</Button>

<Button maxTaps={5} onMultiTap={(e) => setCount(e.count)}>
  Multi-tap: {count}
</Button>`}
      >
        <Button
          variant="secondary"
          onDoubleTap={() => {
            setLikes((n) => n + 1);
            setHeart(true);
            setTimeout(() => setHeart(false), 400);
          }}
          onSingleTap={() => toast('Double-tap to like', { duration: 1500 })}
          startContent={
            <span className={'transition-colors duration-200 ease-out ' + (heart ? 'text-danger-hover' : 'text-danger')}>
              <Ico d={I.heart} fill={likes > 0} />
            </span>
          }
        >
          {likes} likes
        </Button>
        <Button
          variant="primary"
          holdDuration={3000}
          onHoldStart={() => setSeconds(0)}
          onHoldTick={(e) => setSeconds(e.seconds)}
          onHold={() => toast.success('Held for 3 seconds')}
          onHoldCancel={() => setSeconds(0)}
        >
          Hold for 3s · <span className="tabular-nums">{seconds}s</span>
        </Button>
        <Button onMultiTap={(e) => setCount(e.count)} maxTaps={5}>
          Multi-tap: <span className="w-3 tabular-nums">{count}</span>
        </Button>
      </Example>
    </Entry>
  );
}

export function UseGestureEntry() {
  const [selected, setSelected] = useState(false);
  const [open, setOpen] = useState(false);
  const { gestureProps, isPressed } = useGesture({
    onSingleTap: () => setSelected((s) => !s),
    onDoubleTap: () => setOpen(true),
    onHold: () => toast('Context menu (hold)'),
  });
  return (
    <Entry id="use-gesture" title="useGesture">
      <Example
        code={`const { gestureProps, isPressed } = useGesture({
  onSingleTap: () => setSelected((s) => !s),
  onDoubleTap: () => setOpen(true),
  onHold: () => showContextMenu(),
});

return (
  <div {...gestureProps} role="button" tabIndex={0} aria-pressed={selected}>
    photo.jpg
  </div>
);

// Composing with a React Aria component? useGestureHandlers returns
// press handlers + pointer props to merge into its own props instead.
const { pressHandlers, pointerProps } = useGestureHandlers({ onDoubleTap: open });`}
      >
        <div
          {...gestureProps}
          role="button"
          tabIndex={0}
          aria-pressed={selected}
          className={
            'flex h-24 w-40 flex-col items-center justify-center rounded-[12px] border text-sm outline-none select-none transition-[background-color,border-color] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ' +
            (selected
              ? 'border-primary-line ' + (isPressed ? 'bg-primary-pressed text-primary-fg' : 'bg-primary text-primary-fg')
              : 'border-line ' + (isPressed ? 'bg-surface-pressed text-fg' : 'bg-surface text-fg'))
          }
        >
          <span>photo.jpg</span>
          <span className="text-xs opacity-60">tap · double-tap · hold</span>
        </div>
        <DialogTrigger isOpen={open} onOpenChange={setOpen}>
          <Modal>
            <Dialog title="photo.jpg" description="Opened with a double tap.">
              <Skeleton className="h-40 w-full rounded-[10px]" />
            </Dialog>
          </Modal>
        </DialogTrigger>
      </Example>
    </Entry>
  );
}
