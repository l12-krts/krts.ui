import {
  AlertDialog,
  Button,
  Checkbox,
  CheckboxGroup,
  CopyButton,
  Dialog,
  DialogTrigger,
  Drawer,
  Menu,
  MenuItem,
  MenuSection,
  MenuSeparator,
  MenuTrigger,
  Modal,
  Popover,
  Slider,
  SubmenuTrigger,
  Switch,
  TextField,
  ToggleButton,
  Tooltip,
  TooltipTrigger,
  WithTooltip,
  toast,
} from 'krts.ui';
import { Entry, Example, I, Ico } from '../ui';

export function TooltipEntry() {
  return (
    <Entry id="tooltip" title="Tooltip">
      <Example
        code={`<TooltipTrigger>
  <ToggleButton isIconOnly aria-label="Bold"><BoldIcon /></ToggleButton>
  <Tooltip shortcut="⌘B">Bold</Tooltip>
</TooltipTrigger>

<TooltipTrigger>
  <Button>Hover or focus me</Button>
  <Tooltip placement="right" showArrow>Tooltips work with keyboard focus too.</Tooltip>
</TooltipTrigger>

// Shorthand
<WithTooltip content="Saves to the cloud" shortcut="⌘S">
  <Button variant="primary">Save</Button>
</WithTooltip>`}
      >
        <div className="flex gap-1 rounded-[12px] border border-line bg-surface p-1 shadow-control">
          {(
            [
              ['Bold', '⌘B', I.bold],
              ['Italic', '⌘I', I.italic],
              ['Underline', '⌘U', I.underline],
              ['Insert link', '⌘K', I.link],
            ] as const
          ).map(([label, kb, d]) => (
            <TooltipTrigger key={label}>
              <ToggleButton aria-label={label} size="sm" isIconOnly className="border-transparent shadow-none">
                <Ico d={d} />
              </ToggleButton>
              <Tooltip shortcut={kb}>{label}</Tooltip>
            </TooltipTrigger>
          ))}
        </div>
        <TooltipTrigger>
          <Button>Hover or focus me</Button>
          <Tooltip placement="right" showArrow>
            Tooltips work with keyboard focus too.
          </Tooltip>
        </TooltipTrigger>
        <WithTooltip content="Saves to the cloud" shortcut="⌘S">
          <Button variant="primary">Save</Button>
        </WithTooltip>
      </Example>
    </Entry>
  );
}

export function MenuEntry() {
  return (
    <Entry id="menu" title="Menu">
      <Example
        className="items-start"
        code={`<MenuTrigger>
  <Button>Options</Button>
  <Menu onAction={(key) => run(key)}>
    <MenuSection title="Edit">
      <MenuItem id="cut" shortcut="⌘X">Cut</MenuItem>
      <MenuItem id="copy" shortcut="⌘C">Copy</MenuItem>
      <MenuItem id="paste" shortcut="⌘V" isDisabled>Paste</MenuItem>
    </MenuSection>
    <MenuSeparator />
    <SubmenuTrigger>
      <MenuItem>Share</MenuItem>
      <Menu placement="end top" onAction={(key) => share(key)}>
        <MenuItem id="email">Email</MenuItem>
        <MenuItem id="link">Copy link</MenuItem>
      </Menu>
    </SubmenuTrigger>
    <MenuSeparator />
    <MenuItem id="delete" variant="danger">Delete</MenuItem>
  </Menu>
</MenuTrigger>`}
      >
        <MenuTrigger>
          <Button>Options</Button>
          <Menu onAction={(k) => toast(`Action: ${String(k)}`)}>
            <MenuSection title="Edit">
              <MenuItem id="cut" shortcut="⌘X">
                Cut
              </MenuItem>
              <MenuItem id="copy" shortcut="⌘C">
                Copy
              </MenuItem>
              <MenuItem id="paste" shortcut="⌘V" isDisabled>
                Paste
              </MenuItem>
            </MenuSection>
            <MenuSeparator />
            <SubmenuTrigger>
              <MenuItem>Share</MenuItem>
              <Menu placement="end top" onAction={(k) => toast(`Shared via ${String(k)}`)}>
                <MenuItem id="email">Email</MenuItem>
                <MenuItem id="link">Copy link</MenuItem>
              </Menu>
            </SubmenuTrigger>
            <MenuSeparator />
            <MenuItem id="delete" variant="danger">
              Delete
            </MenuItem>
          </Menu>
        </MenuTrigger>
      </Example>
    </Entry>
  );
}

export function PopoverEntry() {
  return (
    <Entry id="popover" title="Popover">
      <Example
        code={`<DialogTrigger>
  <Button>Notifications</Button>
  <Popover placement="bottom start" className="w-72">
    <Dialog title="Notifications" showClose={false}>
      <Switch defaultSelected>Email</Switch>
      <Switch>Push</Switch>
    </Dialog>
  </Popover>
</DialogTrigger>`}
      >
        <DialogTrigger>
          <Button>Notifications</Button>
          <Popover placement="bottom start" className="w-72">
            <Dialog title="Notifications" showClose={false} className="gap-3 p-4">
              <Switch defaultSelected size="sm">
                Email
              </Switch>
              <Switch size="sm">Push</Switch>
            </Dialog>
          </Popover>
        </DialogTrigger>
      </Example>
    </Entry>
  );
}

export function DialogEntry() {
  return (
    <Entry id="dialog" title="Dialog">
      <Example
        code={`<DialogTrigger>
  <Button variant="primary">Open dialog</Button>
  <Modal>
    <Dialog
      title="Invite teammates"
      description="They'll get an email with a link to join."
      footer={(close) => (
        <>
          <Button size="sm" onPress={close}>Cancel</Button>
          <Button size="sm" variant="primary" onPress={() => { close(); sendInvites(); }}>
            Send invites
          </Button>
        </>
      )}
    >
      <TextField label="Email addresses" placeholder="ana@example.com" autoFocus />
    </Dialog>
  </Modal>
</DialogTrigger>`}
      >
        <DialogTrigger>
          <Button variant="primary">Open dialog</Button>
          <Modal>
            <Dialog
              title="Invite teammates"
              description="They'll get an email with a link to join."
              footer={(close) => (
                <>
                  <Button size="sm" onPress={close}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onPress={() => {
                      close();
                      toast.success('Invites sent');
                    }}
                  >
                    Send invites
                  </Button>
                </>
              )}
            >
              <TextField label="Email addresses" placeholder="ana@example.com" autoFocus />
            </Dialog>
          </Modal>
        </DialogTrigger>
      </Example>
    </Entry>
  );
}

export function AlertDialogEntry() {
  return (
    <Entry id="alert-dialog" title="AlertDialog">
      <Example
        code={`<DialogTrigger>
  <Button variant="danger">Delete account</Button>
  <Modal size="sm">
    <AlertDialog
      title="Delete account?"
      description="This permanently removes your data. This can't be undone."
      variant="danger"
      confirmLabel="Delete"
      onConfirm={deleteAccount}
    />
  </Modal>
</DialogTrigger>`}
      >
        <DialogTrigger>
          <Button variant="danger">Delete account</Button>
          <Modal size="sm">
            <AlertDialog
              title="Delete account?"
              description="This permanently removes your data. This can't be undone."
              variant="danger"
              confirmLabel="Delete"
              onConfirm={() => {
                toast.error('Account deleted');
              }}
            />
          </Modal>
        </DialogTrigger>
      </Example>
    </Entry>
  );
}

export function ModalEntry() {
  return (
    <Entry id="modal" title="Modal">
      <Example
        code={`<DialogTrigger>
  <Button>Small</Button>
  <Modal size="sm">
    <Dialog title="Small modal">…</Dialog>
  </Modal>
</DialogTrigger>

// size: 'sm' | 'md' (default) | 'lg'
// isDismissable closes it when the backdrop is clicked
<Modal size="lg" isDismissable>…</Modal>`}
      >
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <DialogTrigger key={size}>
            <Button>{size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : 'Large'}</Button>
            <Modal size={size} isDismissable>
              <Dialog title={`${size.toUpperCase()} modal`} description="Click the backdrop or press Escape to close." />
            </Modal>
          </DialogTrigger>
        ))}
      </Example>
    </Entry>
  );
}

export function DrawerEntry() {
  return (
    <Entry id="drawer" title="Drawer">
      <Example
        code={`<DialogTrigger>
  <Button>Open drawer</Button>
  <Drawer>
    <Dialog title="Filters" className="h-full">
      <CheckboxGroup label="Status" defaultValue={['open']}>
        <Checkbox value="open">Open</Checkbox>
        <Checkbox value="closed">Closed</Checkbox>
      </CheckboxGroup>
      <Slider label="Minimum score" defaultValue={30} />
    </Dialog>
  </Drawer>
</DialogTrigger>

<DialogTrigger>
  <Button>Bottom sheet</Button>
  <Drawer side="bottom">
    <Dialog title="Share" description="Anyone with the link can view.">
      <TextField aria-label="Link" defaultValue="https://krts.ui/s/a8f3" isReadOnly />
      <CopyButton value="https://krts.ui/s/a8f3" isIconOnly={false} size="md" />
    </Dialog>
  </Drawer>
</DialogTrigger>

// side: 'right' (default) | 'left' | 'bottom'`}
      >
        <DialogTrigger>
          <Button>Open drawer</Button>
          <Drawer>
            <Dialog title="Filters" className="h-full">
              <div className="flex flex-col gap-5">
                <CheckboxGroup label="Status" defaultValue={['open']}>
                  <Checkbox value="open">Open</Checkbox>
                  <Checkbox value="closed">Closed</Checkbox>
                </CheckboxGroup>
                <Slider label="Minimum score" defaultValue={30} />
              </div>
            </Dialog>
          </Drawer>
        </DialogTrigger>
        <DialogTrigger>
          <Button>Left drawer</Button>
          <Drawer side="left">
            <Dialog title="Navigation" className="h-full" />
          </Drawer>
        </DialogTrigger>
        <DialogTrigger>
          <Button>Bottom sheet</Button>
          <Drawer side="bottom">
            <Dialog title="Share" description="Anyone with the link can view.">
              <div className="flex gap-2">
                <TextField aria-label="Link" defaultValue="https://krts.ui/s/a8f3" isReadOnly className="flex-1" />
                <CopyButton value="https://krts.ui/s/a8f3" size="md" isIconOnly={false} />
              </div>
            </Dialog>
          </Drawer>
        </DialogTrigger>
      </Example>
    </Entry>
  );
}
