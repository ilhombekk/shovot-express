import { useCartStore } from '../store/cartStore'

export default function ProductCard({ product }) {
  const { items, add, remove } = useCartStore()
  const qty = items[product.id] || 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden active:scale-95 transition-transform">
      <div className="h-24 flex items-center justify-center bg-gray-50 text-5xl">
        {product.emoji}
      </div>
      <div className="p-2.5">
        <p className="text-sm font-bold text-gray-900 leading-tight mb-0.5">
          {product.name}
        </p>
        <p className="text-xs text-gray-400 font-semibold mb-2">
          {product.weight}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-extrabold text-gray-900">
              {(product.price / 1000).toFixed(0)}K
            </span>
            <span className="text-xs text-gray-400 ml-0.5">so'm</span>
          </div>

          {qty === 0 ? (
            <button
              onClick={() => add(product)}
              className="w-8 h-8 rounded-full bg-[#2db67d] text-white text-xl font-bold flex items-center justify-center active:scale-90 transition-transform"
            >
              +
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => remove(product.id)}
                className="w-6 h-6 rounded-full border border-gray-200 bg-gray-50 text-gray-700 text-base font-bold flex items-center justify-center"
              >
                −
              </button>
              <span className="text-sm font-extrabold w-4 text-center">{qty}</span>
              <button
                onClick={() => add(product)}
                className="w-6 h-6 rounded-full bg-[#2db67d] text-white text-base font-bold flex items-center justify-center"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
