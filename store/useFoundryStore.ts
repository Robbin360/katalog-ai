import { create } from 'zustand'

// 1. Definimos la forma de los datos (La Interfaz)
interface FoundryState {
  selectedProductId: number | null
  setSelectedProduct: (id: number | null) => void
}

// 2. Creamos el Hook (El almacén real)
export const useFoundryStore = create<FoundryState>((set) => ({
  // Estado inicial
  selectedProductId: null,

  // Acciones (Funciones para cambiar el estado)
  setSelectedProduct: (id) => set({ selectedProductId: id }),
}))
