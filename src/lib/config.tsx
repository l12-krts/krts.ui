import { createContext, useContext, type ReactNode } from 'react';

/** How floating menus (Menu, Select, DropdownButton, Popover) appear. */
export type OverlayAnimation = 'fade' | 'scale' | 'none';

export interface KrtsConfig {
  /**
   * Default animation for menus, selects and popovers.
   * `'fade'` (default) is a quick opacity fade — calm enough for dashboards
   * where menus open dozens of times a day. `'scale'` grows the menu out of
   * its trigger. `'none'` shows it instantly.
   */
  menuAnimation: OverlayAnimation;
}

const defaults: KrtsConfig = { menuAnimation: 'fade' };
const KrtsContext = createContext<KrtsConfig>(defaults);

/** Optional. Sets app-wide defaults; any component prop still wins. */
export function KrtsProvider({ children, ...config }: Partial<KrtsConfig> & { children: ReactNode }) {
  const parent = useContext(KrtsContext);
  return <KrtsContext.Provider value={{ ...parent, ...config }}>{children}</KrtsContext.Provider>;
}

export function useKrtsConfig(): KrtsConfig {
  return useContext(KrtsContext);
}
