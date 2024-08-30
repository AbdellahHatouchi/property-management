import { create } from 'zustand';

interface useBusinessModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useBusinessModal = create<useBusinessModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
