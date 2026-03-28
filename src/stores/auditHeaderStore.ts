import { create } from 'zustand';

/**
 * Store for passing audit title from answer/review screens to the Drawer header.
 * Used when we want the top bar to show the audit name instead of "Denetimler".
 */
interface AuditHeaderState {
  title: string;
  setTitle: (title: string) => void;
  clear: () => void;
}

export const useAuditHeaderStore = create<AuditHeaderState>((set) => ({
  title: '',
  setTitle: (title) => set({ title }),
  clear: () => set({ title: '' }),
}));
