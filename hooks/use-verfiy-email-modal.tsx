import { create } from 'zustand';

interface useVerifyEmailModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useVerifyEmailModal = create<useVerifyEmailModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
