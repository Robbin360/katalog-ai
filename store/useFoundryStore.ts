import { create } from 'zustand'

interface FoundryState {
    selectedProductId: number | null
    isSheetOpen: boolean
    openProduct: (id: number) => void
    closeProduct: () => void
}

export const useFoundryStore = create<FoundryState>((set) => ({
    selectedProductId: null,
    isSheetOpen: false,
    openProduct: (id) => set({ selectedProductId: id, isSheetOpen: true }),
    closeProduct: () => set({ selectedProductId: null, isSheetOpen: false }),
}))
