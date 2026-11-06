import { useEffect, useMemo, useState } from 'react';
import { Button, Dialog, DialogTrigger, Drawer, Link, Toaster, WithTooltip, cn } from 'krts.ui';
import { groups } from './entries';
import { SidebarContent, useScrollSpy } from './Sidebar';
import { I, Ico, Section } from './ui';

function useTheme() {
  const [dark, setDark] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);
  return [dark, setDark] as const;
}

/** Remembers whether the sidebar is collapsed (per browser; safe if storage is blocked). */
function useCollapsed() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('krts-docs-sidebar') === 'collapsed';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('krts-docs-sidebar', collapsed ? 'collapsed' : 'open');
    } catch {
      /* ignore */
    }
  }, [collapsed]);
  return [collapsed, setCollapsed] as const;
}

export function App() {
  const [dark, setDark] = useTheme();
  const [collapsed, setCollapsed] = useCollapsed();
  const [mobileOpen, setMobileOpen] = useState(false);
  const ids = useMemo(() => groups.flatMap((g) => g.entries.map((e) => e.id)), []);
  const activeId = useScrollSpy(ids);

  const sidebar = { groups, activeId, dark, onToggleTheme: () => setDark(!dark) };

  return (
    <div className="min-h-screen bg-bg text-fg">
      <Toaster />

      {/* Desktop sidebar */}
      <aside
        aria-label="Documentation"
        inert={collapsed}
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line-subtle bg-bg lg:block',
          'transition-transform duration-250 ease-out motion-reduce:transition-none',
          collapsed && '-translate-x-full',
        )}
      >
        <SidebarContent {...sidebar} onCollapse={() => setCollapsed(true)} />
      </aside>

      {/* Desktop: reopen button while collapsed */}
      <div
        inert={!collapsed}
        className={cn(
          'fixed top-3 left-3 z-30 hidden transition-opacity duration-200 ease-out lg:block',
          collapsed ? 'opacity-100 delay-150' : 'pointer-events-none opacity-0',
        )}
      >
        <WithTooltip content="Show sidebar" placement="right">
          <Button variant="secondary" size="sm" isIconOnly aria-label="Show sidebar" onPress={() => setCollapsed(false)}>
            <Ico d={I.sidebar} />
          </Button>
        </WithTooltip>
      </div>

      {/* Mobile: slim bar + drawer with the same navigation */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line-subtle bg-bg/85 px-3 backdrop-blur-md lg:hidden">
        <Button variant="ghost" size="sm" isIconOnly aria-label="Open navigation" onPress={() => setMobileOpen(true)}>
          <Ico d={I.menu} />
        </Button>
        <a href="#top" className="text-[15px] font-semibold tracking-tight">
          krts.ui<span className="text-fg-subtle">/docs</span>
        </a>
      </div>
      <DialogTrigger isOpen={mobileOpen} onOpenChange={setMobileOpen}>
        <Drawer side="left" isDismissable>
          <Dialog aria-label="Documentation" showClose={false} className="h-full gap-0 p-0">
            <SidebarContent {...sidebar} onNavigate={() => setMobileOpen(false)} />
          </Dialog>
        </Drawer>
      </DialogTrigger>

      <div className={cn('transition-[padding] duration-250 ease-out motion-reduce:transition-none', collapsed ? 'lg:pl-0' : 'lg:pl-64')}>
        <main id="top" className="mx-auto max-w-4xl px-4 sm:px-8">
          <HeroSection></HeroSection>
          {groups.map((g) => (
            <Section key={g.id} id={g.id} title={g.title}>
              {g.entries.map(({ id, Component }) => (
                <Component key={id} />
              ))}
            </Section>
          ))}

          <footer className="border-t border-line-subtle py-10 text-sm text-fg-subtle">
            krts.ui - Built on <Link href="https://react-spectrum.adobe.com/react-aria/">React Aria</Link> and{' '}
            <Link href="https://tailwindcss.com">Tailwind CSS</Link>.
          </footer>
        </main>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-2 px-2 py-10 text-center text-balance sm:p-12">
      <h1 className="text-4xl font-semibold sm:text-5xl">krts.ui documentation</h1>
      <h3 className="text-xl font-normal text-fg-subtle sm:text-2xl">Some examples of krts.ui library and the gesture engine being put to use.</h3>
    </div>
  );
}
