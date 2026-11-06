import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, ChevronDownIcon, SearchField, WithTooltip, cn } from 'krts.ui';
import type { DocGroup } from './entries';
import { I, Ico } from './ui';

export interface SidebarProps {
  groups: DocGroup[];
  activeId: string | null;
  dark: boolean;
  onToggleTheme: () => void;
  /** Desktop only: hides the sidebar. */
  onCollapse?: () => void;
  /** Called after a link is followed (closes the mobile drawer). */
  onNavigate?: () => void;
}

export function SidebarContent({ groups, activeId, dark, onToggleTheme, onCollapse, onNavigate }: SidebarProps) {
  const [query, setQuery] = useState('');
  const [closed, setClosed] = useState<Record<string, boolean>>({});
  const navRef = useRef<HTMLElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({ ...g, entries: g.entries.filter((e) => e.title.toLowerCase().includes(q)) }))
      .filter((g) => g.entries.length > 0);
  }, [groups, query]);

  // Keep the active link visible inside the sidebar as you scroll the page.
  useEffect(() => {
    if (!activeId) return;
    const nav = navRef.current;
    const link = nav?.querySelector<HTMLElement>(`[data-nav="${activeId}"]`);
    if (!nav || !link) return;
    // Scroll only the sidebar list — scrollIntoView would also nudge the page
    // and cancel an in-progress smooth scroll.
    const top = link.offsetTop; // nav is the offsetParent (relative)
    if (top < nav.scrollTop + 8) nav.scrollTop = top - 8;
    else if (top + link.offsetHeight > nav.scrollTop + nav.clientHeight - 8) nav.scrollTop = top + link.offsetHeight - nav.clientHeight + 8;
  }, [activeId]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 pr-2 pl-5">
        <a href="#top" onClick={onNavigate} className="text-[15px] font-semibold tracking-tight">
          krts.ui<span className="text-fg-subtle">/docs</span>
        </a>
        {onCollapse && (
          <WithTooltip content="Hide sidebar" placement="right">
            <Button variant="ghost" size="sm" isIconOnly aria-label="Hide sidebar" onPress={onCollapse}>
              <Ico d={I.sidebar} />
            </Button>
          </WithTooltip>
        )}
      </div>

      <div className="shrink-0 px-3 pb-3">
        <SearchField aria-label="Filter components" placeholder="Filter components" size="sm" value={query} onChange={setQuery} />
      </div>

      <nav ref={navRef} aria-label="Components" className="relative min-h-0 flex-1 overflow-y-auto px-3 pb-6">
        {filtered.length === 0 && <p className="px-2 py-1.5 text-sm text-fg-subtle">No matches.</p>}
        {filtered.map((g) => {
          const isOpen = query ? true : !closed[g.id];
          return (
            <div key={g.id} className="mt-1 first:mt-0">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`nav-${g.id}`}
                onClick={() => setClosed((c) => ({ ...c, [g.id]: !c[g.id] }))}
                className="flex h-8 w-full items-center justify-between rounded-md px-2 text-[12.5px] font-medium tracking-wide text-fg-subtle outline-none hover:text-fg focus-visible:outline-2 focus-visible:outline-focus"
              >
                {g.title}
                <ChevronDownIcon size={14} className={cn('transition-transform duration-200 ease-out', !isOpen && '-rotate-90')} />
              </button>
              {/* grid-rows 0fr → 1fr animates to the list's natural height */}
              <div
                id={`nav-${g.id}`}
                className={cn(
                  'grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none',
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                )}
                inert={!isOpen}
              >
                <ul className="min-h-0 overflow-hidden">
                  {g.entries.map((e) => {
                    const active = e.id === activeId;
                    return (
                      <li key={e.id}>
                        <a
                          href={`#${e.id}`}
                          data-nav={e.id}
                          aria-current={active ? 'location' : undefined}
                          onClick={onNavigate}
                          className={cn(
                            'flex h-8 items-center rounded-md px-2 text-[14px] outline-none focus-visible:outline-2 focus-visible:outline-focus',
                            active ? 'bg-surface font-medium text-fg' : 'text-fg-muted hover:bg-surface/60 hover:text-fg',
                          )}
                        >
                          {e.title}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-line-subtle p-3">
        <Button
          variant="ghost"
          size="sm"
          animateWidth={false}
          className="w-full justify-start"
          onPress={onToggleTheme}
          startContent={<Ico d={dark ? I.sun : I.moon} />}
        >
          {dark ? 'Light mode' : 'Dark mode'}
        </Button>
      </div>
    </div>
  );
}

/**
 * Highlights the last entry whose heading has reached the top of the
 * viewport (within `offset` px). Driven by scroll position, so it is
 * exact after jumping to an anchor.
 */
export function useScrollSpy(ids: string[], offset = 120): string | null {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      let current: string | null = ids[0] ?? null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top - offset <= 0) current = id;
      }
      // At the very bottom, the last entries can't reach the top: pick the last one.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = ids[ids.length - 1] ?? current;
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ids, offset]);
  return active;
}
