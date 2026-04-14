import { useCartStore } from '../store/cartStore'

export default function CartBar({ products, onOpen }) {
  const { items, getCount, getTotal } = useCartStore()
  const count = getCount()
  const total = getTotal(products)

  if (count === 0) {
    return (
      <div className="sticky bottom-0 px-3.5 pb-4 pt-2.5 bg-[#f7faf9] border-t border-gray-100">
        <button
          disabled
          className="w-full py-3.5 bg-gray-200 text-gray-400 rounded-2xl font-extrabold text-sm"
        >
          Savat bo'sh
        </button>
      </div>
    )
  }

  return (
    <div className="sticky bottom-0 px-3.5 pb-4 pt-2.5 bg-[#f7faf9] border-t border-gray-100">
      <button
        onClick={onOpen}
        className="w-full py-3.5 bg-[#2db67d] text-white rounded-2xl font-extrabold text-sm flex items-center justify-between px-4 active:scale-98 transition-transform"
      >
        <span>
          Buyurtma berish{' '}
          <span className="bg-white/25 px-2.5 py-0.5 rounded-full text-xs ml-1">
            {count} ta
          </span>
        </span>
        <span className="font-bold">
          {total.toLocaleString('uz-UZ')} so'm
        </span>
      </button>
    </div>
  )
}
