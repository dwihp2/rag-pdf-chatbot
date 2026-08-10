import { create } from "zustand";

interface ChatStore {
  activeThreadId: string | null;
  isFloatingOpen: boolean;
  setActiveThreadId: (id: string | null) => void;
  toggleFloating: () => void;
  openFloating: () => void;
  closeFloating: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  activeThreadId: null,
  isFloatingOpen: false,
  setActiveThreadId: (id) => set({ activeThreadId: id }),
  toggleFloating: () => set((s) => ({ isFloatingOpen: !s.isFloatingOpen })),
  openFloating: () => set({ isFloatingOpen: true }),
  closeFloating: () => set({ isFloatingOpen: false }),
}));
