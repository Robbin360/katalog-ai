import { create } from 'zustand';

interface FoundryState {
  selectedProductId: number | null;
  setSelectedProduct: (id: number | null) => void;
}

export const useFoundryStore = create<FoundryState>((set) => ({
  selectedProductId: null,
  setSelectedProduct: (id) => set({ selectedProductId: id }),
}));
