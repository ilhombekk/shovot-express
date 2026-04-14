import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: {},      // { productId: quantity }
      
      add: (product) => set((state) => ({
        items: {
          ...state.items,
          [product.id]: (state.items[product.id] || 0) + 1
        }
      })),

      remove: (productId) => set((state) => {
        const items = { ...state.items }
        if (items[productId] > 1) {
          items[productId]--
        } else {
          delete items[productId]
        }
        return { items }
      }),

      clear: () => set({ items: {} }),

      getCount: () => {
        const items = get().items
        return Object.values(items).reduce((sum, qty) => sum + qty, 0)
      },

      getTotal: (products) => {
        const items = get().items
        return Object.entries(items).reduce((sum, [id, qty]) => {
          const product = products.find(p => p.id === parseInt(id))
          return sum + (product ? product.price * qty : 0)
        }, 0)
      },

      getCartItems: (products) => {
        const items = get().items
        return Object.entries(items)
          .map(([id, qty]) => {
            const product = products.find(p => p.id === parseInt(id))
            return product ? { ...product, qty } : null
          })
          .filter(Boolean)
      }
    }),
    { name: 'shovot-cart' }
  )
)
