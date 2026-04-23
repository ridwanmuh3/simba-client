import { create } from "zustand";
import { UserModalStore } from "./types";

export const useUserModal = create<UserModalStore>((set) => ({
  isOpen: false,
  type: null,
  data: null,
  onOpen: (type, data = null) => set({ isOpen: true, type, data }),
  onClose: () => set({ isOpen: false, type: null, data: null }),
}));
