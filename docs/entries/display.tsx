import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CopyIcon,
  Kbd,
  MinusIcon,
  PlusIcon,
  SearchIcon,
  Separator,
  XIcon,
} from 'krts.ui';
import { Entry, Example } from '../ui';

export function BadgeEntry() {
  return (
    <Entry id="badge" title="Badge">
      <Example
        code={`<Badge>Neutral</Badge>
<Badge tone="solid">Solid</Badge>
<Badge tone="success" dot>Live</Badge>
<Badge tone="warning" dot>Degraded</Badge>
<Badge tone="danger" dot>Down</Badge>`}
      >
        <Badge>Neutral</Badge>
        <Badge tone="solid">Solid</Badge>
        <Badge tone="success" dot>
          Live
        </Badge>
        <Badge tone="warning" dot>
          Degraded
        </Badge>
        <Badge tone="danger" dot>
          Down
        </Badge>
      </Example>
    </Entry>
  );
}

export function AvatarEntry() {
  return (
    <Entry id="avatar" title="Avatar">
      <Example
        code={`<Avatar name="Ada Lovelace" />
<Avatar name="Grace Hopper" size={44} />
<Avatar src="/photos/alan.jpg" name="Alan Turing" size={52} />

// Stacked
<div className="flex -space-x-1.5">
  <Avatar name="Ada Lovelace" className="ring-2 ring-bg" />
  <Avatar name="Grace Hopper" className="ring-2 ring-bg" />
  <Avatar name="Alan Turing" className="ring-2 ring-bg" />
</div>`}
      >
        <Avatar name="Ada Lovelace" />
        <Avatar name="Grace Hopper" size={44} />
        <Avatar name="Alan Turing" size={52} />
        <div className="flex -space-x-1.5">
          <Avatar name="Ada Lovelace" className="ring-2 ring-bg" />
          <Avatar name="Grace Hopper" className="ring-2 ring-bg" />
          <Avatar name="Alan Turing" className="ring-2 ring-bg" />
        </div>
      </Example>
    </Entry>
  );
}

export function KbdEntry() {
  return (
    <Entry id="kbd" title="Kbd">
      <Example code={`Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to search`}>
        <span className="flex items-center gap-1 text-sm text-fg-muted">
          Press <Kbd>⌘</Kbd>
          <Kbd>K</Kbd> to search
        </span>
      </Example>
    </Entry>
  );
}

export function CardEntry() {
  return (
    <Entry id="card" title="Card">
      <Example
        className="bg-surface/40"
        code={`<Card className="w-80">
  <CardHeader
    title="Weekly report"
    description="Generated every Monday."
    action={<Badge tone="success" dot>On</Badge>}
  />
  <Button size="sm" variant="primary">View report</Button>
</Card>`}
      >
        <Card className="w-80">
          <CardHeader
            title="Weekly report"
            description="Generated every Monday."
            action={
              <Badge tone="success" dot>
                On
              </Badge>
            }
          />
          <Button size="sm" variant="primary">
            View report
          </Button>
        </Card>
      </Example>
    </Entry>
  );
}

export function SeparatorEntry() {
  return (
    <Entry id="separator" title="Separator">
      <Example
        className="flex-col items-stretch"
        code={`<Separator />
<div className="flex h-6 items-center gap-3">
  Docs <Separator orientation="vertical" /> Changelog <Separator orientation="vertical" /> GitHub
</div>`}
      >
        <Separator />
        <div className="flex h-6 items-center gap-3 text-sm text-fg-muted">
          Docs <Separator orientation="vertical" /> Changelog <Separator orientation="vertical" /> GitHub
        </div>
      </Example>
    </Entry>
  );
}

export function IconsEntry() {
  const icons = { CheckIcon, ChevronDownIcon, ChevronRightIcon, CopyIcon, MinusIcon, PlusIcon, SearchIcon, XIcon };
  return (
    <Entry id="icons" title="Icons">
      <Example code={`import { CheckIcon, ChevronDownIcon, CopyIcon, SearchIcon, XIcon } from 'krts.ui';

<SearchIcon size={20} />`}>
        {Object.entries(icons).map(([name, Icon]) => (
          <div key={name} className="flex w-28 flex-col items-center gap-2 rounded-[10px] border border-line-subtle p-3 text-fg">
            <Icon size={20} />
            <span className="text-[11px] text-fg-muted">{name}</span>
          </div>
        ))}
      </Example>
    </Entry>
  );
}
