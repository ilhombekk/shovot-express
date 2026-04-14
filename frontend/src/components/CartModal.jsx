import { useCartStore } from '../store/cartStore'
import { createOrder } from '../api'
import { useTelegram } from '../hooks/useTelegram'

const DELIVERY_FEE = 5000

export default function CartModal({ products, isOpen, onClose }) {
  const { items, add, remove, clear, getCartItems, getTotal } = useCartStore()
  const { user, queryId } = useTelegram()
  const cartItems = getCartItems(products)
  const subtotal = getTotal(products)
  const total = subtotal + DELIVERY_FEE

  if (!isOpen) return null

  const handleOrder = async () => {
    try {
      await createOrder({
        items: cartItems.map(i => ({ productId: i.id, qty: i.qty, price: i.price })),
        total,
        deliveryFee: DELIVERY_FEE,
        telegramUser: user,
        queryId,
      })
      clear()
      onClose()
      alert('✅ Buyurtmangiz qabul qilindi! Tez orada bog\'lanamiz.')
    } catch (e) {
      alert('Xato yuz berdi. Qayta urinib ko\'ring.')
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/45 z-50 flex items-end"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full rounded-t-3xl max-h-[80vh] overflow-y-auto">
        <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mt-2.5 mb-3.5" />
        <h2 className="text-lg font-extrabold px-4 pb-3 border-b border-gray-100">
          🛒 Savatingiz
        </h2>

        <div className="px-4 py-2">
          {cartItems.map(item => (
            <div key={item.id} className="flex items-center gap-2.5 py-2.5 border-b border-gray-50 last:border-0">
              <span className="text-3xl w-10 text-center">{item.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-bold">{item.name}</p>
                <p className="text-xs text-gray-400 font-semibold">
                  {item.price.toLocaleString('uz-UZ')} so'm × {item.qty}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => remove(item.id)}
                  className="w-6 h-6 rounded-full border border-gray-200 bg-gray-50 text-sm font-bold flex items-center justify-center"
                >−</button>
                <span className="text-sm font-extrabold w-4 text-center">{item.qty}</span>
                <button
                  onClick={() => add(item)}
                  className="w-6 h-6 rounded-full bg-[#2db67d] text-white text-sm font-bold flex items-center justify-center"
                >+</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-4 bg-gray-50 rounded-xl p-3 mb-3">
          <div className="flex justify-between text-sm text-gray-500 font-semibold mb-1.5">
            <span>Mahsulotlar</span>
            <span>{subtotal.toLocaleString('uz-UZ')} so'm</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500 font-semibold mb-2">
            <span>Yetkazib berish</span>
            <span>{DELIVERY_FEE.toLocaleString('uz-UZ')} so'm</span>
          </div>
          <div className="flex justify-between text-base font-extrabold pt-2 border-t border-gray-200">
            <span>Jami</span>
            <span>{total.toLocaleString('uz-UZ')} so'm</span>
          </div>
        </div>

        <button
          onClick={handleOrder}
          className="mx-4 mb-6 w-[calc(100%-32px)] py-3.5 bg-[#2db67d] text-white rounded-2xl font-extrabold text-sm active:bg-[#1f9463] transition-colors"
        >
          Buyurtma berish
        </button>
      </div>
    </div>
  )
}
